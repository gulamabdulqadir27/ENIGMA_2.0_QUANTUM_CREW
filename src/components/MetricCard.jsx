// feat: add reusable metric display card with optional progress bar
// ─────────────────────────────────────────────────────────────
import React from "react";

export default function MetricCard({
  title, value, suffix = "", sub,
  color = "#7c3aed", isLoading,
  showBar = false, isBadge = false, tooltip,
}) {
  // style: skeleton shown during loading state
  if (isLoading) return (
    <div className="metric-card skeleton">
      <div className="skeleton-line short" />
      <div className="skeleton-line tall" />
      <div className="skeleton-line short" />
    </div>
  );

  return (
    <div className="metric-card">
      {/* feat: card header with optional tooltip */}
      <div className="metric-title">
        {title}
        {tooltip && (
          <span className="tooltip-trigger" title={tooltip}> ⓘ</span>
        )}
      </div>

      {/* feat: main value display — badge or number style */}
      {isBadge ? (
        <>
          <div className="metric-badge" style={{ background: color + "22", color }}>
            {value}
          </div>
          {sub && <div className="metric-sub">{sub}</div>}
        </>
      ) : (
        <>
          <div className="metric-value" style={{ color }}>
            {value}{suffix}
          </div>
          {sub && <div className="metric-sub">{sub}</div>}
        </>
      )}

      {/* feat: progress bar for risk score visualization */}
      {showBar && value !== null && (
        <div className="metric-bar-bg">
          <div
            className="metric-bar-fill"
            style={{ width: `${value}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}