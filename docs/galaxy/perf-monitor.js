/* Adaptive performance monitor — samples frame times and degrades/restores
   quality settings to maintain smooth FPS on varying hardware.

   Escalation ladder (each level adds to the previous):
     0 = full quality
     1 = pixel ratio capped at 1.5
     2 = pixel ratio capped at 1.0
     3 = volumetric nebulae disabled
     4 = compositor disabled (far-LOD BH only)                              */

const BUCKET_WIDTH = 2;
const BUCKET_COUNT = 20;
const WINDOW_FRAMES = 120;
const DEGRADE_COOLDOWN = 3000;
const RESTORE_COOLDOWN = 12000;
const RESTORE_CONSECUTIVE = 3;
const P95_DEGRADE = 18;
const P95_RESTORE = 12;
const USER_OVERRIDE_MS = 60000;

export function createPerfMonitor(onLevelChange) {
  const histogram = new Uint32Array(BUCKET_COUNT);
  let totalSamples = 0;
  let currentLevel = 0;
  let lastDegrade = 0;
  let lastRestore = 0;
  let comfortStreak = 0;
  let lastStreakCheck = 0;
  const STREAK_INTERVAL = 2000;
  let overrideUntil = 0;
  let bypassed = false;

  function sample(frameTimeMs) {
    if (bypassed) return;

    /* Sliding histogram — decay oldest samples gradually */
    if (totalSamples >= WINDOW_FRAMES) {
      for (let i = 0; i < BUCKET_COUNT; i++)
        histogram[i] = (histogram[i] * (WINDOW_FRAMES - 1) / WINDOW_FRAMES) | 0;
      totalSamples = WINDOW_FRAMES - 1;
    }
    const bucket = Math.min((frameTimeMs / BUCKET_WIDTH) | 0, BUCKET_COUNT - 1);
    histogram[bucket]++;
    totalSamples++;

    if (totalSamples < WINDOW_FRAMES) return;
    const now = performance.now();
    if (now < overrideUntil) return;

    /* p95 from histogram — O(buckets), no allocation */
    const target = Math.floor(totalSamples * 0.95);
    let cumulative = 0;
    let p95 = 0;
    for (let i = 0; i < BUCKET_COUNT; i++) {
      cumulative += histogram[i];
      if (cumulative >= target) { p95 = (i + 1) * BUCKET_WIDTH; break; }
    }

    if (p95 > P95_DEGRADE && currentLevel < 4 && now - lastDegrade > DEGRADE_COOLDOWN) {
      currentLevel++;
      lastDegrade = now;
      comfortStreak = 0;
      onLevelChange(currentLevel, 'degrade', p95);
    } else if (p95 < P95_RESTORE && currentLevel > 0 && now - lastRestore > RESTORE_COOLDOWN) {
      /* Only count one comfortable reading per 2s window — prevents 3 consecutive
         frames from satisfying the streak (which would be ~50ms, not real hysteresis) */
      if (now - lastStreakCheck > STREAK_INTERVAL) {
        comfortStreak++;
        lastStreakCheck = now;
        if (comfortStreak >= RESTORE_CONSECUTIVE) {
          currentLevel--;
          lastRestore = now;
          comfortStreak = 0;
          onLevelChange(currentLevel, 'restore', p95);
        }
      }
    } else if (p95 >= P95_RESTORE) {
      comfortStreak = 0;
    }
  }

  /* User manually re-enabled something the watchdog disabled */
  function userOverride() {
    overrideUntil = performance.now() + USER_OVERRIDE_MS;
  }

  /* Cinema/Muse bypass — watchdog sleeps entirely */
  function setBypass(on) {
    bypassed = on;
    if (!on) {
      /* Reset histogram after bypass so stale data doesn't trigger degradation */
      histogram.fill(0);
      totalSamples = 0;
      comfortStreak = 0;
    }
  }

  return {
    sample,
    getLevel: () => currentLevel,
    userOverride,
    setBypass
  };
}
