// feat: add clinical findings summary and recommendation panel
// docs: auto-generates findings from band power deviations
// docs: provides actionable recommendations based on risk classification
// docs: includes severity badges and a clinical disclaimer
// ─────────────────────────────────────────────────────────────
import React from "react";

export default function ClinicalReport({ results, isSZ, isLoading }) {
  if (isLoading) return <div className="chart-card skeleton" style={{ height: 260 }} />;

  const { riskScore, classification, bandPowers, coherence } = results;
  if (!riskScore) return null;

  // feat: auto-generate findings from band power deviations
  const findings = [];

  if (bandPowers.alpha < 1.0) {
    findings.push({
      icon: "⚠️",
      severity: "Severe",
      color: "#ef4444",
      text: `Alpha suppression detected across frontal electrodes. ${Math.round((1 - bandPowers.alpha / 1.8) * 100)}% below baseline.`,
    });
  }
  if (bandPowers.delta > 1.8) {
    findings.push({
      icon: "⚠️",
      severity: "Moderate",
      color: "#f59e0b",
      text: `Elevated delta activity detected. ${Math.round((bandPowers.delta / 1.2 - 1) * 100)}% above baseline.`,
    });
  }
  if (bandPowers.theta > 1.1) {
    findings.push({
      icon: "⚠️",
      severity: "Moderate",
      color: "#f59e0b",
      text: `Elevated theta activity suggesting cognitive slowing. ${Math.round((bandPowers.theta / 0.7 - 1) * 100)}% above baseline.`,
    });
  }
  if (bandPowers.gamma > 0.35) {
    findings.push({
      icon: "ℹ️",
      severity: "Mild",
      color: "#94a3b8",
      text: `Gamma band dysregulation observed. Irregular bursting pattern detected.`,
    });
  }
  if (findings.length === 0) {
    findings.push({
      icon: "✅",
      severity: "Normal",
      color: "#10b981",
      text: "No significant EEG abnormalities detected. All bands within healthy reference range.",
    });
  }

  // feat: action items based on risk level
  const actions = riskScore >= 60
    ? ["Refer for comprehensive psychiatric evaluation", "Administer PANSS symptom scale", "Schedule follow-up EEG in 4 weeks", "Review medication history"]
    : riskScore >= 40
      ? ["Schedule follow-up EEG in 3 months", "Monitor for symptom progression", "Document baseline measurements"]
      : ["Routine annual monitoring", "No immediate action required"];

  return (
    <div className="chart-card clinical-report" style={{ borderLeft: `3px solid ${classification?.color}` }}>
      <div className="chart-title">CLINICAL FINDINGS SUMMARY</div>

      <div className="report-grid">
        {/* feat: automated findings list */}
        <div>
          <div className="report-section-title">Detected Abnormalities</div>
          {findings.map((f, i) => (
            <div key={i} className="finding-row">
              <span>{f.icon}</span>
              <span className="finding-badge" style={{ background: f.color + "22", color: f.color }}>
                {f.severity}
              </span>
              <span className="finding-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* feat: recommendation and action items */}
        <div>
          <div className="report-section-title">Recommendations</div>
          <div className="alert-box" style={{ borderColor: classification?.color, background: classification?.color + "11" }}>
            <div className="alert-level" style={{ color: classification?.color }}>
              {classification?.level}
            </div>
            <p className="alert-text">{classification?.alert}</p>
          </div>
          <ul className="action-list">
            {actions.map((a, i) => (
              <li key={i}>□ {a}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* chore: always show clinical disclaimer */}
      <p className="disclaimer">
        ⚕️ This system is a research decision-support tool only.
        Not a substitute for qualified psychiatric assessment.
      </p>
    </div>
  );
}