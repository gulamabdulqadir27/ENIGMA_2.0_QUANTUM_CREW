// feat: add sidebar with subject controls, CSV upload, and session history
// docs: handles all user input — subject type, seed, CSV file, and analyze trigger
// ─────────────────────────────────────────────────────────────
import React, { useState, useRef } from "react";

// feat: sidebar component — receives all state and handlers from App
export default function Sidebar({
  isSZ, setIsSZ, seed, setSeed,
  onAnalyze, isLoading,
  sessionHistory, onLoadHistory,
  csvData, csvFileName, csvError, onCSVUpload, onCSVClear,
}) {
  // feat: drag-and-drop visual feedback state
  const [isDragging, setIsDragging] = useState(false);
  // chore: ref for hidden file input element
  const fileInputRef = useRef(null);

  // feat: handle file selection from native file picker
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // fix: read file as text before passing to parent handler
    const reader = new FileReader();
    reader.onload = (evt) => onCSVUpload(evt.target.result, file.name);
    reader.readAsText(file);
    // chore: reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  // feat: handle CSV file dropped into the drop zone
  const handleDrop = (e) => {
    e.preventDefault();
    // style: remove drag-over visual highlight
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // fix: read dropped file as text before passing to parent
    const reader = new FileReader();
    reader.onload = (evt) => onCSVUpload(evt.target.result, file.name);
    reader.readAsText(file);
  };

  // style: add visual highlight when dragging over the drop zone
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  // style: remove visual highlight when drag leaves the drop zone
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  return (
    <aside className="sidebar">
      {/* feat: subject type selector — healthy vs schizophrenia patient */}
      <div className="sidebar-section">
        <div className="sidebar-label">SUBJECT TYPE</div>
        <div className="subject-selector">
          {[false, true].map((val) => (
            <button
              key={String(val)}
              className={`subject-btn ${isSZ === val ? "active" : ""} ${csvData ? "disabled-dim" : ""}`}
              onClick={() => !csvData && setIsSZ(val)}
              disabled={!!csvData}
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
          disabled={!!csvData}
        />
        {/* docs: each seed generates a unique but reproducible patient profile */}
        <p className="seed-hint">Each seed = unique patient profile</p>
      </div>

      {/* feat: CSV upload section — drag-and-drop or click to browse */}
      <div className="sidebar-section">
        <div className="sidebar-label">UPLOAD EEG DATA</div>
        {!csvData ? (
          // feat: empty state — show drop zone for file selection
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* chore: hidden file input — triggered by click on drop zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className="csv-dropzone-icon">📂</div>
            <div className="csv-dropzone-text">
              Drop CSV here or <span className="csv-browse">browse</span>
            </div>
            {/* docs: hint showing required CSV column format */}
            <div className="csv-dropzone-hint">
              Columns: time, Fp1, F3, C3, P3, O1
            </div>
          </div>
        ) : (
          // feat: loaded state — show filename, row count, and clear button
          <div className="csv-file-info">
            <div className="csv-file-row">
              <span className="csv-file-icon">📄</span>
              <div className="csv-file-details">
                <div className="csv-file-name">{csvFileName}</div>
                <div className="csv-file-rows">{csvData.length} data points</div>
              </div>
              {/* feat: clear button — removes uploaded file and reverts to simulation mode */}
              <button className="csv-clear-btn" onClick={onCSVClear} title="Remove file">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* fix: display parsing error message if CSV validation fails */}
        {csvError && (
          <div className="csv-error">⚠️ {csvError}</div>
        )}
      </div>

      {/* feat: analyze button — triggers full EEG analysis pipeline */}
      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={isLoading}
      >
        {isLoading ? (
          // style: show spinner animation during processing
          <><span className="spinner" /> Processing EEG...</>
        ) : (
          // feat: button label changes based on data source (CSV vs simulated)
          <>🧠 {csvData ? "Analyze Uploaded EEG" : "Analyze EEG"}</>
        )}
      </button>

      {/* docs: model metadata display — shows ML model specifications */}
      <div className="sidebar-section model-info">
        <div className="sidebar-label">MODEL INFO</div>
        <div className="model-row"><span>Model:</span><span>XGBoost</span></div>
        <div className="model-row"><span>CV AUC:</span><strong>0.938</strong></div>
        <div className="model-row"><span>Dataset:</span><span>100 subjects</span></div>
        <div className="model-row"><span>Features:</span><span>98 EEG</span></div>
        {/* feat: show data source indicator when CSV is uploaded */}
        {csvData && (
          <div className="model-row"><span>Source:</span><strong style={{ color: "#10b981" }}>CSV Upload</strong></div>
        )}
      </div>

      {/* feat: session history — shows last 5 analyses for quick access */}
      {sessionHistory.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">RECENT ANALYSES</div>
          {sessionHistory.map((entry, i) => (
            // feat: clickable history item — loads previous session's seed & subject type
            <button
              key={i}
              className="history-item"
              onClick={() => onLoadHistory(entry)}
            >
              <span>{entry.isCSV ? "📄" : entry.isSZ ? "⚠️" : "🧠"} {entry.isCSV ? "CSV" : `Seed ${entry.seed}`}</span>
              {/* style: color-coded score based on risk level */}
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
