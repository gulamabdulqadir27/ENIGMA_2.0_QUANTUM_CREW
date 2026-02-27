// feat: add sidebar with subject controls and session history
// ─────────────────────────────────────────────────────────────
import React from "react";

export default function Sidebar({
  isSZ, setIsSZ, seed, setSeed,
  onAnalyze, isLoading,
  sessionHistory, onLoadHistory,
}) {
  return (
    <aside className="sidebar">
      {/* feat: subject type selector */}
      <div className="sidebar-section">
        <div className="sidebar-label">SUBJECT TYPE</div>
        <div className="subject-selector">
          {[false, true].map((val) => (
            <button
              key={String(val)}
              className={`subject-btn ${isSZ === val ? "active" : ""}`}
              onClick={() => setIsSZ(val)}
            >
              {val ? "⚠️ Schizophrenia Patient" : "🧠 Healthy Control"}
            </button>
          ))}
        </div>
      </div>

      {/* feat: seed input for reproducible patient profiles */}
      <div className="sidebar-section">
        <div className="sidebar-label">RANDOM SEED</div>
        <input
          className="seed-input"
          type="number"
          min={0}
          max={9999}
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
        />
        <p className="seed-hint">Each seed = unique patient profile</p>
      </div>

      {/* feat: analyze button triggers full pipeline */}
      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={isLoading}
      >
        {isLoading ? (
          <><span className="spinner" /> Processing EEG...</>
        ) : (
          <>🧠 Analyze EEG</>
        )}
      </button>

      {/* feat: model metadata display */}
      <div className="sidebar-section model-info">
        <div className="sidebar-label">MODEL INFO</div>
        <div className="model-row"><span>Model:</span><span>XGBoost</span></div>
        <div className="model-row"><span>CV AUC:</span><strong>0.938</strong></div>
        <div className="model-row"><span>Dataset:</span><span>100 subjects</span></div>
        <div className="model-row"><span>Features:</span><span>98 EEG</span></div>
      </div>

      {/* feat: session history showing last 5 analyses */}
      {sessionHistory.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">RECENT ANALYSES</div>
          {sessionHistory.map((entry, i) => (
            <button
              key={i}
              className="history-item"
              onClick={() => onLoadHistory(entry)}
            >
              <span>{entry.isSZ ? "⚠️" : "🧠"} Seed {entry.seed}</span>
              <span className="history-score" style={{ color: entry.color }}>
                {entry.score}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
