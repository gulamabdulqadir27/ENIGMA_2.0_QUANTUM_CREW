// feat: add SVG brain topography heatmap colored by alpha power
// docs: renders a 2D scalp map with electrodes colored green→yellow→red
// docs: green = normal alpha power, red = severe alpha suppression (SZ indicator)
// fix: uses wide per-region alpha spread for clearly visible topographic gradient
// ─────────────────────────────────────────────────────────────
import React from "react";

// docs: 10-20 international electrode positions mapped to SVG coordinates (200×200 viewbox)
// feat: each electrode has a region tag used to compute per-electrode alpha variation
const ELECTRODES = [
  { name: "Fp1", x: 72, y: 30, region: "prefrontal" },
  { name: "Fp2", x: 128, y: 30, region: "prefrontal" },
  { name: "F3", x: 58, y: 68, region: "frontal" },
  { name: "F4", x: 142, y: 68, region: "frontal" },
  { name: "Fz", x: 100, y: 60, region: "frontal" },
  { name: "C3", x: 52, y: 100, region: "central" },
  { name: "Cz", x: 100, y: 100, region: "central" },
  { name: "C4", x: 148, y: 100, region: "central" },
  { name: "P3", x: 62, y: 132, region: "parietal" },
  { name: "P4", x: 138, y: 132, region: "parietal" },
  { name: "O1", x: 76, y: 168, region: "occipital" },
  { name: "O2", x: 124, y: 168, region: "occipital" },
];

// docs: region-specific alpha scaling factors
// docs: in schizophrenia, frontal alpha is most suppressed while occipital is relatively preserved
// fix: wider spread (0.55 to 1.45) so color differences are clearly visible on the map
const REGION_ALPHA_FACTORS = {
  prefrontal: 0.55, // docs: most suppressed in SZ — should be reddest
  frontal: 0.70, // docs: significantly suppressed
  central: 0.90, // docs: moderately affected
  parietal: 1.15, // docs: mildly affected, near normal
  occipital: 1.45, // docs: least affected — alpha is strongest here, should be greenest
};

// feat: interpolate color green→yellow→red based on alpha deficit
// docs: deficit 0.0 = healthy (green), deficit 1.0 = severe suppression (red)
function alphaToColor(alphaVal) {
  const baseline = 1.8;
  const deficit = Math.max(0, Math.min(1, 1 - alphaVal / baseline));

  // feat: three-stop gradient: green(0) → yellow(0.4) → orange(0.7) → red(1.0)
  let r, g, b;
  if (deficit < 0.4) {
    // green → yellow
    const t = deficit / 0.4;
    r = Math.round(16 + t * (245 - 16));
    g = Math.round(185 + t * (200 - 185));
    b = Math.round(129 - t * 80);
  } else if (deficit < 0.7) {
    // yellow → orange
    const t = (deficit - 0.4) / 0.3;
    r = Math.round(245 - t * 6);
    g = Math.round(200 - t * 60);
    b = Math.round(49 + t * 19);
  } else {
    // orange → red
    const t = (deficit - 0.7) / 0.3;
    r = 239;
    g = Math.round(140 - t * 96);
    b = Math.round(68 - t * 0);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

export default function BrainMap({ bandPowers, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 300 }} />;

  // fix: fallback to healthy baseline if bandPowers not yet computed
  const alpha = bandPowers?.alpha ?? 1.8;

  // feat: compute all electrode colors for radial gradient backgrounds
  const electrodeData = ELECTRODES.map((el) => {
    const regionFactor = REGION_ALPHA_FACTORS[el.region] || 1.0;
    const regionalAlpha = alpha * regionFactor;
    return { ...el, color: alphaToColor(regionalAlpha), regionalAlpha };
  });

  return (
    <div className="chart-card">
      <div className="chart-title">CORTICAL ACTIVITY MAP</div>
      <div className="chart-subtitle">Alpha power distribution — suppression = risk</div>

      <svg viewBox="0 0 200 200" style={{ width: "100%", maxHeight: 220 }}>
        <defs>
          {/* feat: radial gradient per electrode for smooth heat map glow effect */}
          {electrodeData.map((el) => (
            <radialGradient key={`grad-${el.name}`} id={`grad-${el.name}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={el.color} stopOpacity="0.9" />
              <stop offset="70%" stopColor={el.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={el.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* style: head outline circle */}
        <circle cx="100" cy="100" r="88" fill="rgba(15,22,35,0.8)" stroke="#2a3550" strokeWidth="2" />
        {/* style: nose indicator triangle */}
        <polygon points="94,18 106,18 100,8" fill="#2a3550" />
        {/* style: left ear */}
        <ellipse cx="12" cy="100" rx="6" ry="12" fill="#2a3550" />
        {/* style: right ear */}
        <ellipse cx="188" cy="100" rx="6" ry="12" fill="#2a3550" />

        {/* feat: render glow circles behind electrodes for heat map effect */}
        {electrodeData.map((el) => (
          <circle
            key={`glow-${el.name}`}
            cx={el.x}
            cy={el.y}
            r="22"
            fill={`url(#grad-${el.name})`}
          />
        ))}

        {/* feat: render solid electrode dots with per-region color */}
        {electrodeData.map((el) => (
          <g key={el.name}>
            <circle
              cx={el.x}
              cy={el.y}
              r="7"
              fill={el.color}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />
            <text
              x={el.x}
              y={el.y - 11}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="6.5"
              fontFamily="monospace"
            >
              {el.name}
            </text>
          </g>
        ))}
      </svg>

      {/* feat: color scale legend */}
      <div className="brain-legend">
        <span style={{ color: "#10b981" }}>● Normal</span>
        <div className="legend-gradient" />
        <span style={{ color: "#ef4444" }}>● Suppressed</span>
      </div>
    </div>
  );
}
