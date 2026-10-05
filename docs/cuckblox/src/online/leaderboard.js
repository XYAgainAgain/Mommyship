// CUCKBLOX global leaderboard client: Firebase Anonymous Auth and Firestore over plain REST, no Firebase SDK.
// The Firestore security rules are what actually guard the data.

export const ENGINE_VERSION = 1;
export const RATE_LIMIT_MS = 30_000;

const BANDS = ['0-9', '10-15', '16-19'];
export const BOARDS = ['marathon', 'marathonModern', 'retro', ...['practiceClassic', 'practiceModern'].flatMap((m) => BANDS.map((b) => `${m}-${b}`))];

export const isPracticeBoard = (board) => board.startsWith('practice');

/** Calendar months since January 1970, in UTC; the rules derive the same number from server time. */
export function monthIndex(ms) {
  const d = new Date(ms);
  return (d.getUTCFullYear() - 1970) * 12 + d.getUTCMonth();
}

const MONTH_EDGE_MS = 120_000;

/** True within two minutes of the 1st of a month at 00:00 UTC, where the client and server can disagree. */
function nearMonthEdge(ms) {
  return monthIndex(ms - MONTH_EDGE_MS) !== monthIndex(ms + MONTH_EDGE_MS);
}

// Firestore REST wraps every value in a typed object
const encode = (v) => (Number.isInteger(v) ? { integerValue: String(v) } : { stringValue: String(v) });

function decode(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('stringValue' in v) out[k] = v.stringValue;
    else if ('timestampValue' in v) out[k] = Date.parse(v.timestampValue);
    else if ('doubleValue' in v) out[k] = v.doubleValue;
  }
  return out;
}

class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export class Leaderboard {
  /** cfg: apiKey (the browser key, public by design), projectId, endpoints (emulator overrides), injectable fetch,
   *  storage, and now, plus notice(msg) for quiet player messages such as a refused queued score. */
  constructor(cfg) {
    this.apiKey = cfg.apiKey;
    this.projectId = cfg.projectId;
    this.authUrl = cfg.endpoints?.auth ?? 'https://identitytoolkit.googleapis.com';
    this.tokenUrl = cfg.endpoints?.token ?? 'https://securetoken.googleapis.com';
    this.firestoreUrl = cfg.endpoints?.firestore ?? 'https://firestore.googleapis.com';
    this.fetch = cfg.fetch ?? globalThis.fetch.bind(globalThis);
    this.storage = cfg.storage ?? globalThis.localStorage;
    this.now = cfg.now ?? Date.now;
    this.notice = cfg.notice ?? (() => {});
    this.idToken = null;
    this.idTokenExpires = 0;
    this.flushTimer = null;
    this.flushing = null;
    // Mirrors every write so the queue and sign-in still work for this session when storage is blocked
    this.memory = new Map();
    // Keys whose last write didn't reach storage, so storage holds an older value than memory
    this.unsaved = new Set();
  }

  get #dbPath() {
    return `projects/${this.projectId}/databases/(default)`;
  }

  get #docsUrl() {
    return `${this.firestoreUrl}/v1/${this.#dbPath}/documents`;
  }

  // Storage

  #read(key, fallback) {
    let stored = null;
    try {
      stored = JSON.parse(this.storage.getItem(key) ?? 'null');
    } catch {
      stored = null;
    }
    if (this.unsaved.has(key) || stored == null) return this.memory.has(key) ? this.memory.get(key) : stored ?? fallback;
    return stored;
  }

  #write(key, value) {
    this.memory.set(key, value);
    try {
      this.storage.setItem(key, JSON.stringify(value));
      this.unsaved.delete(key);
    } catch {
      this.unsaved.add(key);
      // Without storage the player signs in fresh next time and the queue lives only in memory
    }
  }

  get queue() {
    return this.#read('cuckblox-lb-queue', []);
  }

  set queue(q) {
    this.#write('cuckblox-lb-queue', q);
  }

  // Auth

  async #json(url, init) {
    const res = await this.fetch(url, init);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new HttpError(res.status, body);
    return body;
  }

  /** Signs in anonymously once per browser, then keeps the hour-long ID token fresh with the refresh token. */
  async #user(force = false) {
    if (!force && this.idToken && this.now() < this.idTokenExpires - 60_000) return this.#read('cuckblox-lb-user', null);
    const saved = this.#read('cuckblox-lb-user', null);
    if (saved?.refreshToken) {
      try {
        const r = await this.#json(`${this.tokenUrl}/v1/token?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(saved.refreshToken)}`,
        });
        this.idToken = r.id_token;
        this.idTokenExpires = this.now() + Number(r.expires_in) * 1000;
        const user = { uid: r.user_id, refreshToken: r.refresh_token };
        this.#write('cuckblox-lb-user', user);
        return user;
      } catch (e) {
        if (!(e instanceof HttpError) || e.status >= 500) throw e;
        // A refused refresh token (account cleaned up) falls through to a fresh anonymous sign-in
      }
    }
    const r = await this.#json(`${this.authUrl}/v1/accounts:signUp?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    });
    this.idToken = r.idToken;
    this.idTokenExpires = this.now() + Number(r.expiresIn) * 1000;
    const user = { uid: r.localId, refreshToken: r.refreshToken };
    this.#write('cuckblox-lb-user', user);
    return user;
  }

  /** Authenticated request; a 401 refreshes the token once and retries. */
  async #authed(url, init) {
    await this.#user();
    const go = () => this.#json(url, { ...init, headers: { ...init.headers, Authorization: `Bearer ${this.idToken}` } });
    try {
      return await go();
    } catch (e) {
      if (!(e instanceof HttpError) || e.status !== 401) throw e;
      await this.#user(true);
      return go();
    }
  }

  // Reading

  /** A board's top 10, all-time or this month. Reads are public, so no sign-in happens here. */
  async top(board, { monthly = false } = {}) {
    const field = (fieldPath, value) => ({ fieldFilter: { field: { fieldPath }, op: 'EQUAL', value: encode(value) } });
    const filters = [field('board', board)];
    if (monthly) filters.push(field('month', monthIndex(this.now())));
    const order = isPracticeBoard(board) ? ['blocks', 'score'] : ['score'];
    const structuredQuery = {
      from: [{ collectionId: 'scores' }],
      where: filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } },
      orderBy: [...order.map((fieldPath) => ({ field: { fieldPath }, direction: 'DESCENDING' })), { field: { fieldPath: 'createdAt' }, direction: 'ASCENDING' }],
      limit: 10,
    };
    const rows = await this.#json(`${this.#docsUrl}:runQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
    });
    return rows.filter((r) => r.document).map((r) => ({ id: r.document.name.split('/').pop(), ...decode(r.document.fields) }));
  }

  /** Where a finished run would land on its board's all-time and monthly top 10 (1-based, 0 when it misses). */
  async placings(board, run) {
    const [all, month] = await Promise.all([this.top(board), this.top(board, { monthly: true })]);
    return { allTime: placing(board, all, run), monthly: placing(board, month, run) };
  }

  /** Whether a finished run would make either top 10 on its board. */
  async qualifies(board, run) {
    const p = await this.placings(board, run);
    return p.allTime > 0 || p.monthly > 0;
  }

  /** This browser's anonymous player ID, or null before its first submission. */
  get uid() {
    return this.#read('cuckblox-lb-user', null)?.uid ?? null;
  }

  // Submitting

  // Two tabs share one queue, so every read-modify-write of it runs under a cross-tab lock where browsers have one
  #locked(fn) {
    const locks = globalThis.navigator?.locks;
    return locks ? locks.request('cuckblox-leaderboard', fn) : fn();
  }

  /** Queues a score; the queue survives reloads and sends whenever the connection and the rate limit allow.
   *  Resolves to the flush result plus the entry's document id. */
  async submit({ board, initials, score, lines, blocks, startLevel, playMs }) {
    const entry = { id: crypto.randomUUID(), board, initials, score, lines, blocks, startLevel, playMs, queuedAt: this.now() };
    await this.#locked(() => { this.queue = [...this.queue, entry]; });
    // A flush that finished just before this entry was queued may not have let go of `flushing` yet
    await this.flushing;
    return { ...(await this.flush()), id: entry.id };
  }

  /** Sends queued scores one at a time, at least 30 s apart. Resolves once the queue is empty or must wait. */
  flush() {
    this.flushing ??= this.#locked(() => this.#flush()).finally(() => { this.flushing = null; });
    return this.flushing;
  }

  async #flush() {
    clearTimeout(this.flushTimer);
    for (;;) {
      const [entry] = this.queue;
      if (!entry) return { pending: 0 };
      const wait = this.#read('cuckblox-lb-last', 0) + RATE_LIMIT_MS - this.now();
      if (wait > 0) {
        this.flushTimer = setTimeout(() => this.flush(), wait + 250);
        return { pending: this.queue.length, retryInMs: wait };
      }
      let outcome;
      try {
        outcome = await this.#send(entry);
      } catch {
        outcome = 'retry';
      }
      // A refusal gets two more tries 30 s apart first: another tab sharing this player can trip the rate limit
      if (outcome === 'rejected' && (entry.refusals ?? 0) < 2) {
        this.queue = this.queue.map((e) => (e.id === entry.id ? { ...e, refusals: (e.refusals ?? 0) + 1 } : e));
        outcome = 'retry';
      }
      if (outcome === 'retry') {
        this.flushTimer = setTimeout(() => this.flush(), RATE_LIMIT_MS);
        return { pending: this.queue.length };
      }
      if (outcome === 'rejected') this.notice('A queued score was turned down by the leaderboard and dropped.');
      this.queue = this.queue.filter((e) => e.id !== entry.id);
    }
  }

  /** One attempt for one entry: 'sent', 'rejected' (the rules refused it), or 'retry' (try again later). */
  async #send(entry, monthShift = 0) {
    const user = await this.#user();
    const month = monthIndex(this.now()) + monthShift;
    const fields = {
      board: encode(entry.board),
      initials: encode(entry.initials),
      score: encode(entry.score),
      lines: encode(entry.lines),
      blocks: encode(entry.blocks),
      startLevel: encode(entry.startLevel),
      playMs: encode(entry.playMs),
      month: encode(month),
      engine: encode(ENGINE_VERSION),
      uid: encode(user.uid),
    };
    const body = {
      writes: [
        {
          update: { name: `${this.#dbPath}/documents/scores/${entry.id}`, fields },
          currentDocument: { exists: false },
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
        },
        {
          update: { name: `${this.#dbPath}/documents/players/${user.uid}`, fields: {} },
          updateTransforms: [{ fieldPath: 'lastSubmit', setToServerValue: 'REQUEST_TIME' }],
        },
      ],
    };
    this.#write('cuckblox-lb-last', this.now());
    try {
      await this.#authed(`${this.firestoreUrl}/v1/${this.#dbPath}/documents:commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return 'sent';
    } catch (e) {
      if (!(e instanceof HttpError) || e.status >= 500 || e.status === 429) {
        return (await this.#exists(entry.id)) ? 'sent' : 'retry';
      }
      // A repeat of a write that already landed looks like a refusal, so check before giving up on it
      if (await this.#exists(entry.id)) return 'sent';
      if (e.status === 403 && monthShift === 0 && nearMonthEdge(this.now())) {
        const other = monthIndex(this.now() + MONTH_EDGE_MS) !== month ? 1 : -1;
        return this.#send(entry, other);
      }
      return 'rejected';
    }
  }

  async #exists(id) {
    try {
      const res = await this.fetch(`${this.#docsUrl}/scores/${id}`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

// Game-side helpers: ranking, row text, the initials editor, and the board-view state. All pure.

export const TOP = 10;
export const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const GLYPH_SET = new Set(GLYPHS);

/** True when entry a ranks strictly above b: more blocks then more score in Practice, more score elsewhere. */
export function outranks(board, a, b) {
  return isPracticeBoard(board) ? a.blocks > b.blocks || (a.blocks === b.blocks && a.score > b.score) : a.score > b.score;
}

/** The rank a run would take in a fetched top 10 (1-based), or 0 when it misses. Ties go to the earlier entry. */
export function placing(board, list, run) {
  const ahead = list.filter((e) => !outranks(board, run, e)).length;
  return ahead < TOP ? ahead + 1 : 0;
}

/** Whether a run is worth checking at all: the rules need a block, and a scoreless run never earns a score board slot. */
export function eligible(run) {
  return BOARDS.includes(run.board) && run.blocks >= 1 && (isPracticeBoard(run.board) || run.score > 0);
}

/** Resolves to the promise's value, or to `fallback` after `ms`; a slow network never holds a screen hostage. */
export function within(promise, ms, fallback) {
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(fallback), ms); });
  return Promise.race([Promise.resolve(promise).catch(() => fallback), late]).finally(() => clearTimeout(timer));
}

/** Whether a finished run gets the initials screen: it made a top 10, or the check couldn't run (offline, timed out)
 *  and the run beat this browser's own best on that board, which stands in for the rank check offline. */
export function offerInitials(verdict, improvedLocally) {
  return verdict === 'yes' || (verdict !== 'no' && !!improvedLocally);
}

/** What a submit result means for the player: sent, waiting out the 30 s rate limit, or stuck offline. */
export function submitOutcome(result) {
  if (!result) return 'offline';
  if (result.pending === 0) return 'sent';
  return result.retryInMs !== undefined ? 'waiting' : 'offline';
}

/** The ranked number a board shows: blocks on Practice boards, score everywhere else. */
export const rankedValue = (board, e) => (isPracticeBoard(board) ? e.blocks : e.score);

/** One arcade row, `01 SAM.....101,420`, exactly `width` characters when it fits. The dot run shrinks first (never
 *  below one), then the rank goes; initials and value are never cut. */
export function formatRow(board, entry, rank, width) {
  const value = rankedValue(board, entry).toLocaleString('en-US');
  const ranked = `${String(rank).padStart(2, '0')} ${entry.initials}`;
  const head = ranked.length + 1 + value.length <= width ? ranked : entry.initials;
  return head + '.'.repeat(Math.max(1, width - head.length - value.length)) + value;
}

/** The three-glyph arcade name entry. It opens browsing (the arrows move between menu rows); while editing, up and
 *  down cycle the glyph under the cursor and typing fills it and moves on. */
export class InitialsEntry {
  constructor(start = 'AAA') {
    const s = String(start ?? '').toUpperCase();
    this.glyphs = [0, 1, 2].map((i) => (GLYPH_SET.has(s[i]) ? s[i] : 'A'));
    this.cursor = 0;
    this.editing = false;
  }

  get text() {
    return this.glyphs.join('');
  }

  /** Starts (or keeps) editing, with the cursor on `slot`. */
  edit(slot = this.cursor) {
    this.editing = true;
    this.cursor = Math.min(2, Math.max(0, slot));
  }

  /** Back to browsing; the glyphs stay as edited. */
  done() {
    this.editing = false;
  }

  step(d) {
    const i = GLYPHS.indexOf(this.glyphs[this.cursor]);
    this.glyphs[this.cursor] = GLYPHS[(i + d + GLYPHS.length * 2) % GLYPHS.length];
  }

  move(d) {
    this.cursor = Math.min(2, Math.max(0, this.cursor + d));
  }

  /** Returns false for anything that isn't a glyph, so the caller can let the key go. */
  type(ch) {
    const c = String(ch).toUpperCase();
    if (c.length !== 1 || !GLYPH_SET.has(c)) return false;
    this.glyphs[this.cursor] = c;
    this.move(1);
    return true;
  }
}

/** One board's top 10 as the board screen sees it: loading, ready (with rows), or error. Reads are cached briefly
 *  so flipping back and forth through boards doesn't refetch, and a late answer for a board no longer shown is dropped. */
export class BoardView {
  constructor(client, { ttlMs = 30_000, timeoutMs = 8_000, now = Date.now, onChange = () => {} } = {}) {
    this.client = client;
    this.ttlMs = ttlMs;
    this.timeoutMs = timeoutMs;
    this.now = now;
    this.onChange = onChange;
    this.cache = new Map();
    this.key = null;
    this.status = 'idle';
    this.rows = [];
  }

  /** Shows a board; resolves once its rows (or its error) are in. */
  async open(board, monthly) {
    const key = `${board}|${monthly ? 'month' : 'all'}`;
    this.key = key;
    const hit = this.cache.get(key);
    if (hit && this.now() - hit.at < this.ttlMs) {
      this.#set('ready', hit.rows);
      return;
    }
    this.#set('loading', []);
    const failed = Symbol('failed');
    const rows = await within(this.client.top(board, { monthly }), this.timeoutMs, failed);
    if (this.key !== key) return;
    if (rows === failed || !Array.isArray(rows)) return this.#set('error', []);
    this.cache.set(key, { rows, at: this.now() });
    this.#set('ready', rows);
  }

  /** Forgets a board's cached rows, after a score went up to it. */
  invalidate(board) {
    for (const k of this.cache.keys()) if (k.startsWith(`${board}|`)) this.cache.delete(k);
  }

  close() {
    this.key = null;
    this.status = 'idle';
    this.rows = [];
  }

  #set(status, rows) {
    this.status = status;
    this.rows = rows;
    this.onChange(this);
  }
}
