// feat: add grouped bar chart comparing patient vs healthy baseline band powers
// docs: displays deviation of each EEG frequency band from healthy reference values
// docs: includes alpha baseline reference line — the primary SZ marker
// fix: patient bars are now color-coded (green=below baseline, red=above baseline, amber=alpha suppressed)
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

// docs: healthy baseline power values (µV²/Hz) from EEG literature
const BASELINES = {
  delta: 1.2, theta: 0.7, alpha: 1.8, beta: 0.5, gamma: 0.2,
};

// feat: maps band names to their display labels with Greek symbols
const BAND_LABELS = {
  delta: "Delta (δ)",
  theta: "Theta (θ)",
  alpha: "Alpha (α)",
  beta: "Beta (β)",
  gamma: "Gamma (γ)",
};

// feat: determine bar color based on deviation type and clinical significance
// docs: alpha suppression = red (bad sign for SZ)
// docs: delta/theta/gamma elevation = red (abnormal increase for SZ)
// docs: values near baseline = green (healthy)
function getBarColor(band, patient, baseline) {
  const deviation = (patient - baseline) / baseline;

  if (band === "alpha") {
    // docs: for alpha, LOWER is worse (suppression = SZ marker)
    if (deviation < -0.3) return "#ef4444";      // style: red — severe suppression
    if (deviation < -0.15) return "#f59e0b";      // style: amber — moderate suppression
    return "#10b981";                              // style: green — healthy range
  } else {
    // docs: for delta/theta/gamma, HIGHER is worse (elevation = SZ marker)
    if (deviation > 0.4) return "#ef4444";         // style: red — significant elevation
    if (deviation > 0.2) return "#f59e0b";         // style: amber — moderate elevation
    return "#10b981";                              // style: green — healthy range
  }
}

export default function BandPowerChart({ bandPowers, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 300 }} />;

  // feat: build chart data comparing patient vs baseline per band
  // fix: now includes deviation percentage and color-coded status
  const chartData = Object.entries(BASELINES).map(([band, base]) => {
    const patient = bandPowers[band] || 0;
    const dev = patient ? Math.round(((patient - base) / base) * 100) : 0;
    return {
      band: BAND_LABELS[band] || band,
      bandKey: band,
      Patient: parseFloat(patient.toFixed(3)),
      Baseline: base,
      dev,
      color: getBarColor(band, patient, base),
    };
  });

  // feat: custom tooltip showing deviation percentage and direction
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;
    const sign = data.dev > 0 ? "+" : "";
    const direction = data.bandKey === "alpha"
      ? (data.dev < 0 ? "⬇ Suppressed" : "✓ Normal")
      : (data.dev > 0 ? "⬆ Elevated" : "✓ Normal");

    return (
      <div style={{
        background: "#0f1623", border: "1px solid #1e2a3d",
        borderRadius: 8, padding: "10px 14px", fontSize: 12,
      }}>
        <div style={{ color: "#f1f5f9", fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#7c3aed" }}>Patient: {data.Patient} µV²/Hz</div>
        <div style={{ color: "#475569" }}>Baseline: {data.Baseline} µV²/Hz</div>
        <div style={{ color: data.color, fontWeight: 600, marginTop: 4 }}>
          {direction} ({sign}{data.dev}%)
        </div>
      </div>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-title">FREQUENCY BAND POWER ANALYSIS</div>
      <div className="chart-subtitle">Patient vs Healthy Population Baseline</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" />
          <XAxis dataKey="band" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 11 }} label={{ value: "Power (µV²/Hz)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {/* feat: patient bars colored by clinical deviation status */}
          <Bar dataKey="Patient" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
          {/* style: baseline bars in muted gray for reference */}
          <Bar dataKey="Baseline" fill="#475569" opacity={0.6} radius={[4, 4, 0, 0]} />
          {/* feat: reference line at healthy alpha baseline — most important SZ marker */}
          <ReferenceLine y={1.8} stroke="#10b981" strokeDasharray="4 4" label={{ value: "α Baseline", fill: "#10b981", fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}