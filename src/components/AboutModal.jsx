// feat: add about modal explaining the science and tool usage
// ─────────────────────────────────────────────────────────────
import React from "react";

export default function AboutModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧠 About NeuroScan AI</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>NeuroScan AI analyzes EEG brainwave patterns to detect early risk indicators associated with schizophrenia spectrum conditions.</p>
          <h4>The 5 EEG Bands</h4>
          <ul>
            <li><strong style={{ color: "#7c3aed" }}>Delta (1–4Hz):</strong> Deep sleep waves. Elevated in waking SZ patients.</li>
            <li><strong style={{ color: "#2563eb" }}>Theta (4–8Hz):</strong> Drowsiness. Elevated in cognitive slowing.</li>
            <li><strong style={{ color: "#10b981" }}>Alpha (8–13Hz):</strong> Relaxed wakefulness. SUPPRESSED in schizophrenia.</li>
            <li><strong style={{ color: "#f59e0b" }}>Beta (13–30Hz):</strong> Active thinking. Mildly reduced.</li>
            <li><strong style={{ color: "#ef4444" }}>Gamma (30–45Hz):</strong> Sensory binding. Dysregulated in SZ.</li>
          </ul>
          <h4>What is SHAP?</h4>
          <p>SHAP (SHapley Additive exPlanations) shows which EEG features drove the risk score up or down, making the AI decision transparent and auditable.</p>
          <p className="disclaimer" style={{ marginTop: 16 }}>⚕️ Research prototype only. Not for clinical use.</p>
        </div>
      </div>
    </div>
  );
}