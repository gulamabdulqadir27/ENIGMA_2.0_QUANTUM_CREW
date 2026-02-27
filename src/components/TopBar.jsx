// feat: add fixed top navigation bar with branding and about trigger
// docs: shows app logo, version badge, clinical disclaimer, and about button
// refactor: purely presentational — receives onAbout callback from parent
// ─────────────────────────────────────────────────────────────
import React from "react";

export default function TopBar({ onAbout }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* feat: brand logo and title */}
        <span className="topbar-icon">🧠</span>
        <span className="topbar-title">NeuroScan AI</span>
        <span className="topbar-badge">v1.0 Beta</span>
      </div>
      <div className="topbar-right">
        {/* feat: AI decision support disclaimer badge */}
        <span className="topbar-disclaimer">
          AI Decision Support — Not a Clinical Diagnosis
        </span>
        {/* feat: about button triggers info modal */}
        <button className="topbar-btn" onClick={onAbout} title="About">ℹ</button>
      </div>
    </header>
  );
}