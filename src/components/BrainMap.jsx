// feat: add SVG brain topography heatmap colored by alpha power
// ─────────────────────────────────────────────────────────────
import React from "react";

// feat: 10-20 electrode positions as % of SVG dimensions (200x200)
const ELECTRODES = [
  { name: "Fp1", x: 72,  y: 30  },
  { name: "Fp2", x: 128, x: 128, y: 30  },
  { name: "F3",  x: 58,  y: 68  },
  { name: "F4",  x: 142, y: 68  },
  { name: "Fz",  x: 100, y: 60  },
  { name: "C3",  x: 52,  y: 100 },
  { name: "Cz",  x: 100, y: 100 },
  { name: "C4",  x: 148, y: 100 },
  { name: "P3",  x: 62,  y: 132 },
  { name: "P4",  x: 138, y: 132 },
  { name: "O1",  x: 76,  y: 168 },
  { name: "O2",  x: 124, y: 168 },
];

// feat: interpolate color green→yellow→red based on alpha deficit
function alphaToColor(alphaVal) {
  const baseline = 1.8;
  const deficit = Math.max(0, Math.min(1, 1 - alphaVal / baseline));
  if (deficit < 0.5) {
    // green → yellow
    const r = Math.round(deficit * 2 * 245);
    return `rgb(${r}, 200, 100)`;
  } else {
    // yellow → red
    const g = Math.round((1 - (deficit - 0.5) * 2) * 160);
    return `rgb(239, ${g}, 68)`;
  }
}

export default function BrainMap({ bandPowers, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 300 }} />;

  // fix: fallback to healthy baseline if bandPowers not yet computed
  const alpha = bandPowers?.alpha ?? 1.8;

  return (
    <div className="chart-card">
      <div className="chart-title">CORTICAL ACTIVITY MAP</div>
      <div className="chart-subtitle">Alpha power distribution — suppression = risk</div>

      <svg viewBox="0 0 200 200" style={{ width: "100%", maxHeight: 220 }}>
        {/* style: head outline circle */}
        <circle cx="100" cy="100" r="88" fill="rgba(15,22,35,0.8)" stroke="#2a3550" strokeWidth="2" />
        {/* style: nose indicator */}
        <polygon points="94,18 106,18 100,8" fill="#2a3550" />
        {/* style: left ear */}
        <ellipse cx="12" cy="100" rx="6" ry="12" fill="#2a3550" />
        {/* style: right ear */}
        <ellipse cx="188" cy="100" rx="6" ry="12" fill="#2a3550" />

        {/* feat: render electrode dots colored by alpha deficit */}
        {ELECTRODES.map((el) => {
          const color = alphaToColor(alpha);
          return (
            <g key={el.name}>
              {/* dot */}
              <circle cx={el.x} cy={el.y} r="8" fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              {/* label */}
              <text x={el.x} y={el.y - 12} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                {el.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* feat: color scale legend */}
      <div className="brain-legend">
        <span style={{ color: "#10b981" }}>● Normal Alpha</span>
        <div className="legend-gradient" />
        <span style={{ color: "#ef4444" }}>● Suppressed</span>
      </div>
    </div>
  );
}
