// feat: EEG signal generation and analysis utilities
// docs: all synthetic EEG data is generated using seeded pseudo-random numbers
// docs: same seed → same sequence of numbers → same patient data (fully reproducible)
// docs: this module provides the core simulation pipeline for the NeuroScan AI dashboard

// ─────────────────────────────────────────────────────────────
// feat: seeded pseudo-random number generator (mulberry32)
// Same seed → same sequence of numbers → same patient data
// ─────────────────────────────────────────────────────────────
export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────
// feat: generate raw EEG waveform signal for 5 channels
// Returns 1280 data points (5 seconds at 256Hz)
// Each point: { time, Fp1, F3, C3, P3, O1 }
// ─────────────────────────────────────────────────────────────
export function generateEEGSignal(isSZ, seed) {
  const rng = mulberry32(seed);
  const sfreq = 256;       // samples per second
  const duration = 5;      // seconds
  const nSamples = sfreq * duration; // 1280 total samples
  const channels = ["Fp1", "F3", "C3", "P3", "O1"];

  // perf: pre-compute amplitude and phase params per channel
  // so we don't recalculate inside the sample loop
  const params = channels.map(() => {
    let dA = 0.5 + rng() * 1.0;  // delta amplitude
    let tA = 0.3 + rng() * 0.5;  // theta amplitude
    let aA = 0.8 + rng() * 1.2;  // alpha amplitude
    let bA = 0.2 + rng() * 0.4;  // beta amplitude
    let gA = 0.1 + rng() * 0.2;  // gamma amplitude

    if (isSZ) {
      // feat: apply schizophrenia EEG modifications based on literature
      // delta and theta elevated, alpha suppressed, gamma dysregulated
      dA *= 1.8 + rng() * 0.7;   // ↑ delta (slow wave invasion)
      tA *= 1.5 + rng() * 0.5;   // ↑ theta (cognitive slowing)
      aA *= 0.3 + rng() * 0.3;   // ↓ alpha (KEY marker - suppressed)
      gA *= 1.5 + rng() * 0.7;   // ↑ gamma (dysregulation)
    } else {
      // chore: consume same number of rng calls for consistency
      rng(); rng(); rng(); rng();
    }

    return {
      dA, tA, aA, bA, gA,
      dP: rng() * 2 * Math.PI,   // delta phase offset
      tP: rng() * 2 * Math.PI,   // theta phase offset
      aP: rng() * 2 * Math.PI,   // alpha phase offset
      bP: rng() * 2 * Math.PI,   // beta phase offset
      gP: rng() * 2 * Math.PI,   // gamma phase offset
    };
  });

  // feat: build sample-by-sample signal array
  const signal = [];
  for (let i = 0; i < nSamples; i++) {
    const t = i / sfreq;
    const point = { time: parseFloat(t.toFixed(4)) };

    channels.forEach((ch, ci) => {
      const p = params[ci];
      const noise = (rng() - 0.5) * 0.6; // biological noise

      // signal = sum of all frequency band sine waves + noise
      point[ch] =
        p.dA * Math.sin(2 * Math.PI * 2 * t + p.dP) +  // 2Hz delta
        p.tA * Math.sin(2 * Math.PI * 6 * t + p.tP) +  // 6Hz theta
        p.aA * Math.sin(2 * Math.PI * 10 * t + p.aP) +  // 10Hz alpha
        p.bA * Math.sin(2 * Math.PI * 20 * t + p.bP) +  // 20Hz beta
        p.gA * Math.sin(2 * Math.PI * 40 * t + p.gP) +  // 40Hz gamma
        noise;
    });

    signal.push(point);
  }

  return signal;
}

// ─────────────────────────────────────────────────────────────
// feat: compute frequency band power values per band
// Simulates Welch PSD output using seeded random variation
// Healthy baselines: delta=1.2, theta=0.7, alpha=1.8, beta=0.5, gamma=0.2
// ─────────────────────────────────────────────────────────────
// refactor: uses separate seed offset (+1000) to avoid correlation with signal generation
export function computeBandPowers(isSZ, seed) {
  const rng = mulberry32(seed + 1000); // offset seed to avoid correlation with signal

  // Healthy baseline values from EEG literature
  const baselines = {
    delta: 1.2,
    theta: 0.7,
    alpha: 1.8,
    beta: 0.5,
    gamma: 0.2,
  };

  // Schizophrenia multiplier ranges per band
  const szMultipliers = {
    delta: [1.6, 2.5],   // elevated
    theta: [1.4, 1.9],   // elevated
    alpha: [0.25, 0.55], // suppressed (most important marker)
    beta: [0.7, 0.95],  // slightly reduced
    gamma: [1.4, 2.1],   // dysregulated
  };

  const powers = {};
  Object.entries(baselines).forEach(([band, base]) => {
    let multiplier;
    if (isSZ) {
      const [lo, hi] = szMultipliers[band];
      multiplier = lo + rng() * (hi - lo);
    } else {
      // healthy: ±15% variation around baseline
      multiplier = 0.85 + rng() * 0.30;
    }
    powers[band] = parseFloat((base * multiplier).toFixed(4));
  });

  return powers;
}

// ─────────────────────────────────────────────────────────────
// feat: compute risk score from band powers
// Weighted formula — alpha suppression has highest weight (35%)
// Returns: { score, confidence, keyMarker, components }
// ─────────────────────────────────────────────────────────────
// docs: weighted formula — alpha suppression has highest weight (35%) because it is the strongest SZ marker
export function computeRiskScore(bandPowers, seed) {
  const rng = mulberry32(seed + 2000);

  const { delta, theta, alpha, gamma } = bandPowers;

  // Each component measures deviation from healthy baseline
  const components = {
    delta: parseFloat(((delta / 1.2 - 1) * 20).toFixed(2)),   // weight: 20
    theta: parseFloat(((theta / 0.7 - 1) * 15).toFixed(2)),   // weight: 15
    alpha: parseFloat(((1 - alpha / 1.8) * 35).toFixed(2)),   // weight: 35 (flipped)
    gamma: parseFloat(((gamma / 0.2 - 1) * 10).toFixed(2)),   // weight: 10
  };

  // Raw score = sum of all components, then scale to 0-100
  const rawScore = Object.values(components).reduce((a, b) => a + b, 0);
  const score = Math.min(100, Math.max(0, Math.round(rawScore * 1.2)));

  // Confidence: 80–95% range with seeded noise
  const confidence = Math.round(80 + rng() * 15);

  // feat: determine key marker — whichever component is highest
  const markerMap = {
    delta: "δ Elevation",
    theta: "θ Elevation",
    alpha: "α Suppression",
    gamma: "γ Dysregulation",
  };
  const keyBand = Object.entries(components).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];
  const keyMarker = markerMap[keyBand];

  // Deviation % for key marker display
  const deviations = {
    delta: `+${Math.round((delta / 1.2 - 1) * 100)}% above normal`,
    theta: `+${Math.round((theta / 0.7 - 1) * 100)}% above normal`,
    alpha: `-${Math.round((1 - alpha / 1.8) * 100)}% below normal`,
    gamma: `+${Math.round((gamma / 0.2 - 1) * 100)}% above normal`,
  };

  return { score, confidence, keyMarker, keyDeviation: deviations[keyBand], components };
}

// ─────────────────────────────────────────────────────────────
// feat: generate SHAP-style feature importance values
// Explains which EEG features drove the risk score up or down
// Positive = increases risk, Negative = decreases risk
// ─────────────────────────────────────────────────────────────
// docs: SHAP = SHapley Additive exPlanations — makes AI decisions transparent and auditable
export function generateSHAPValues(isSZ, seed) {
  const rng = mulberry32(seed + 3000);

  // 15 features covering band+channel combos and coherence
  const features = [
    { name: "α · Fz", band: "alpha", region: "Frontal" },
    { name: "δ · Cz", band: "delta", region: "Central" },
    { name: "θ · F3", band: "theta", region: "Frontal" },
    { name: "γ · Fp1", band: "gamma", region: "Prefrontal" },
    { name: "α · C3", band: "alpha", region: "Central" },
    { name: "Coh · Fz→Pz", band: "coh", region: "F-P" },
    { name: "δ · F4", band: "delta", region: "Frontal" },
    { name: "θ · Pz", band: "theta", region: "Parietal" },
    { name: "α · O1", band: "alpha", region: "Occipital" },
    { name: "β · C4", band: "beta", region: "Central" },
    { name: "γ · F3", band: "gamma", region: "Frontal" },
    { name: "Coh · F3→P3", band: "coh", region: "F-P" },
    { name: "δ · Fp1", band: "delta", region: "Prefrontal" },
    { name: "θ · C3", band: "theta", region: "Central" },
    { name: "α · Fp2", band: "alpha", region: "Prefrontal" },
  ];

  // Base SHAP magnitudes per band for SZ vs healthy
  const szSign = { alpha: -1, delta: 1, theta: 1, gamma: 1, beta: -1, coh: -1 };
  const hSign = { alpha: 1, delta: -1, theta: -1, gamma: -1, beta: 1, coh: 1 };
  const szMag = { alpha: [0.15, 0.35], delta: [0.10, 0.28], theta: [0.08, 0.20], gamma: [0.08, 0.22], beta: [0.05, 0.15], coh: [0.08, 0.18] };
  const hMag = { alpha: [0.05, 0.15], delta: [0.03, 0.10], theta: [0.03, 0.08], gamma: [0.03, 0.08], beta: [0.02, 0.08], coh: [0.03, 0.10] };

  const shapValues = features.map((f) => {
    const mag = isSZ ? szMag[f.band] : hMag[f.band];
    const sign = isSZ ? szSign[f.band] : hSign[f.band];
    const base = mag[0] + rng() * (mag[1] - mag[0]);
    const noise = (rng() - 0.5) * 0.03; // ±15% noise
    return {
      ...f,
      value: parseFloat((sign * (base + noise)).toFixed(4)),
    };
  });

  // Sort by absolute SHAP value descending
  return shapValues.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

// ─────────────────────────────────────────────────────────────
// feat: compute alpha coherence between frontal-parietal pairs
// Low coherence in SZ indicates disconnection between regions
// ─────────────────────────────────────────────────────────────
// docs: low coherence in SZ indicates functional disconnection between brain regions
export function computeCoherence(isSZ, seed) {
  const rng = mulberry32(seed + 4000);

  const pairs = ["Fz-Pz", "F3-P3", "F4-P4"];
  const result = {};

  pairs.forEach((pair) => {
    // Healthy coherence: 0.65–0.80 | SZ coherence: 0.25–0.45
    const base = isSZ
      ? 0.25 + rng() * 0.20
      : 0.65 + rng() * 0.15;
    result[pair] = parseFloat((base + (rng() - 0.5) * 0.05).toFixed(3));
  });

  return result;
}

// ─────────────────────────────────────────────────────────────
// feat: classify risk level and recommendation from score
// ─────────────────────────────────────────────────────────────
// docs: score ≥60 = High Risk, 40–59 = Moderate, <40 = Low Risk
export function classifyRisk(score) {
  if (score >= 60) {
    return {
      level: "High Risk",
      color: "#ef4444",
      recommendation: "Immediate psychiatric consultation recommended",
      alert: "Elevated slow-wave activity and reduced alpha coherence patterns observed. Recommend psychiatric evaluation.",
    };
  } else if (score >= 40) {
    return {
      level: "Moderate",
      color: "#f59e0b",
      recommendation: "Schedule follow-up evaluation",
      alert: "Borderline EEG patterns detected. Some abnormalities present. Monitor and retest in 3 months.",
    };
  } else {
    return {
      level: "Low Risk",
      color: "#10b981",
      recommendation: "Routine monitoring",
      alert: "EEG patterns within healthy reference range. No significant abnormalities detected.",
    };
  }
}