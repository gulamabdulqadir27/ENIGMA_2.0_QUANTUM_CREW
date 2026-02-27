// feat: add EEG waveform chart with 5 offset channels
// docs: renders a multi-line chart showing Fp1, F3, C3, P3, O1 EEG channels
// docs: each channel is vertically offset by 8µV so waveforms don't overlap
// perf: decimates 1280 data points to 320 for smoother chart rendering
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// style: distinct color per EEG channel for visual differentiation
const CHANNEL_COLORS = {
  Fp1: "#7c3aed",
  F3: "#2563eb",
  C3: "#10b981",
  P3: "#f59e0b",
  O1: "#ef4444",
};
const CHANNELS = ["Fp1", "F3", "C3", "P3", "O1"];
// docs: vertical offset in µV — keeps waveforms visually separated
const OFFSET = 8;

export default function EEGChart({ data, isLoading }) {
  // perf: only render every 4th point for chart performance (still 320 pts)
  const decimated = data.filter((_, i) => i % 4 === 0);

  // feat: apply vertical offset per channel so they're readable
  const offsetData = decimated.map((pt) => {
    const row = { time: pt.time };
    CHANNELS.forEach((ch, i) => {
      row[ch] = pt[ch] + i * OFFSET;
    });
    return row;
  });

  if (isLoading) return <div className="chart-card skeleton" style={{ height: 320 }} />;

  return (
    <div className="chart-card">
      <div className="chart-title">
        EEG SIGNAL (5 CHANNELS, FIRST 5 SECONDS)
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={offsetData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" />
          <XAxis
            dataKey="time"
            label={{ value: "Time (s)", position: "insideBottom", offset: -10, fill: "#94a3b8", fontSize: 12 }}
            tick={{ fill: "#475569", fontSize: 11 }}
            interval={39} // show tick every ~1 second
          />
          {/* style: hide Y axis since channels are offset — absolute values meaningless */}
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "#0f1623", border: "1px solid #1e2a3d", borderRadius: 8 }}
            labelStyle={{ color: "#94a3b8", fontSize: 11 }}
            itemStyle={{ fontSize: 11 }}
          />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
          {CHANNELS.map((ch) => (
            <Line
              key={ch}
              type="monotone"
              dataKey={ch}
              stroke={CHANNEL_COLORS[ch]}
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
