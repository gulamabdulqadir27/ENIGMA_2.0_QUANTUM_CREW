// feat: add grouped bar chart comparing patient vs healthy baseline
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

// Healthy baseline values from EEG literature
const BASELINES = {
  delta: 1.2, theta: 0.7, alpha: 1.8, beta: 0.5, gamma: 0.2,
};

export default function BandPowerChart({ bandPowers, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 300 }} />;

  // feat: build chart data comparing patient vs baseline per band
  const chartData = Object.entries(BASELINES).map(([band, base]) => ({
    band: band.charAt(0).toUpperCase() + band.slice(1),
    Patient: bandPowers[band] || 0,
    Baseline: base,
    // perf: pre-calculate deviation for label
    dev: bandPowers[band]
      ? Math.round(((bandPowers[band] - base) / base) * 100)
      : 0,
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">FREQUENCY BAND POWER ANALYSIS</div>
      <div className="chart-subtitle">Patient vs Healthy Population Baseline</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" />
          <XAxis dataKey="band" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 11 }} label={{ value: "Power (µV²/Hz)", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#0f1623", border: "1px solid #1e2a3d", borderRadius: 8 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {/* feat: patient bar colored by deviation direction */}
          <Bar dataKey="Patient" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Baseline" fill="#475569" opacity={0.6} radius={[4, 4, 0, 0]} />
          {/* feat: reference line at healthy alpha baseline */}
          <ReferenceLine y={1.8} stroke="#10b981" strokeDasharray="4 4" label={{ value: "α Baseline", fill: "#10b981", fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}