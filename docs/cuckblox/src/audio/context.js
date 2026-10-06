// The one audio context every CUCKBLOX sound shares (effects, ambience, the Osminok beds, and the Elementary music
// player), plus the param ramps. Nodes come only from its create* methods, so the lab tests' fake context can stand in.

/** A new native context, or null where Web Audio is missing. It may start suspended until a gesture resumes it. */
export function createContext() {
  try {
    return globalThis.AudioContext ? new globalThis.AudioContext({ latencyHint: 'balanced' }) : null;
  } catch {
    return null;
  }
}

export const dbToGain = (db) => 10 ** (db / 20);

const MIN_RAMP = 0.005;
// Firefox has no cancelAndHoldAtTime and can't report a param mid-ramp, so each ramp is remembered to start the next
const ramps = new WeakMap();

function valueAt(param, t) {
  const r = ramps.get(param);
  if (!r) return param.value;
  if (t >= r.end) return r.to;
  const p = Math.max(0, (t - r.start) / (r.end - r.start));
  return r.exp ? r.from * (r.to / r.from) ** p : r.from + (r.to - r.from) * p;
}

/** Glides from wherever the param is now: exponential for cutoffs, linear for levels (as Tone's rampTo chose). */
export function rampParam(context, param, value, seconds, exponential = false) {
  const now = context.currentTime;
  const from = valueAt(param, now);
  const end = now + Math.max(MIN_RAMP, seconds);
  const exp = exponential && from > 0 && value > 0;
  param.cancelScheduledValues(now);
  param.setValueAtTime(from, now);
  if (exp) param.exponentialRampToValueAtTime(value, end);
  else param.linearRampToValueAtTime(value, end);
  ramps.set(param, { from, to: value, start: now, end, exp });
}

/** Jumps straight to a value, dropping any ramp in flight. */
export function setParam(context, param, value) {
  const now = context.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(value, now);
  ramps.set(param, { from: value, to: value, start: now, end: now, exp: false });
}
