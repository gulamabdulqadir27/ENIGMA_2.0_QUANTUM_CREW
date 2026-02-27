// feat: add horizontal SHAP feature importance bar chart
// ─────────────────────────────────────────────────────────────
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from "recharts";

export default function SHAPChart({ shapValues, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 380 }} />;

  // feat: take top 12 features for readability
  const top12 = shapValues.slice(0, 12);

  return (
    <div className="chart-card">
      <div className="chart-title">AI EXPLAINABILITY — SHAP ANALYSIS</div>
      <div className="chart-subtitle">
        Feature contributions to final risk score &nbsp;
        <span style={{ color: "#ef4444" }}>■ Increases risk</span>
        &nbsp;&nbsp;
        <span style={{ color: "#2563eb" }}>■ Decreases risk</span>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={top12}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 90, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3d" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#475569", fontSize: 11 }}
            label={{ value: "Impact on Risk Score", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}
            width={85}
          />
          <Tooltip
            contentStyle={{ background: "#0f1623", border: "1px solid #1e2a3d", borderRadius: 8 }}
            formatter={(val, _, props) => [
              val.toFixed(3),
              props.payload.name
            ]}
            itemStyle={{ fontSize: 12 }}
          />
          {/* feat: zero reference line */}
          <ReferenceLine x={0} stroke="#2a3550" strokeWidth={2} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {/* feat: color bars red (positive) or blue (negative) */}
            {top12.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value > 0 ? "#ef4444" : "#2563eb"}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}