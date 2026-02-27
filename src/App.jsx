// feat: root app component with global state management
// Manages subject type, seed, analysis results, and session history

import React, { useState, useCallback } from "react";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import EEGChart from "./components/EEGChart";
import BandPowerChart from "./components/BandPowerChart";
import BrainMap from "./components/BrainMap";
import SHAPChart from "./components/SHAPChart";
import ClinicalReport from "./components/ClinicalReport";
import AboutModal from "./components/AboutModal";
import {
  generateEEGSignal,
  computeBandPowers,
  computeRiskScore,
  generateSHAPValues,
  computeCoherence,
  classifyRisk,
} from "./utils/eegUtils";
import "./App.css";

// feat: initial empty results state
const EMPTY_RESULTS = {
  riskScore: null,
  confidence: null,
  keyMarker: null,
  keyDeviation: null,
  classification: null,
  eegSignal: [],
  bandPowers: {},
  shapValues: [],
  coherence: {},
};

export default function App() {
  // feat: core subject configuration state
  const [isSZ, setIsSZ] = useState(false);
  const [seed, setSeed] = useState(42);

  // feat: analysis result state
  const [results, setResults] = useState(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // feat: UI state
  const [showAbout, setShowAbout] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  // feat: run full EEG analysis pipeline
  // Simulates 1.5s processing delay for realism
  const handleAnalyze = useCallback(() => {
    setIsLoading(true);
    setHasRun(true);

    // chore: simulate async processing delay
    setTimeout(() => {
      // Step 1: generate raw EEG waveform
      const eegSignal = generateEEGSignal(isSZ, seed);

      // Step 2: compute frequency band powers
      const bandPowers = computeBandPowers(isSZ, seed);

      // Step 3: compute risk score from band powers
      const { score, confidence, keyMarker, keyDeviation } =
        computeRiskScore(bandPowers, seed);

      // Step 4: classify risk level
      const classification = classifyRisk(score);

      // Step 5: generate SHAP explainability values
      const shapValues = generateSHAPValues(isSZ, seed);

      // Step 6: compute frontal-parietal coherence
      const coherence = computeCoherence(isSZ, seed);

      // feat: update results state
      setResults({
        riskScore: score,
        confidence,
        keyMarker,
        keyDeviation,
        classification,
        eegSignal,
        bandPowers,
        shapValues,
        coherence,
      });

      // feat: add to session history (max 5 items, FIFO)
      setSessionHistory((prev) => {
        const entry = {
          seed,
          isSZ,
          score,
          level: classification.level,
          color: classification.color,
          time: new Date().toLocaleTimeString(),
        };
        return [entry, ...prev].slice(0, 5);
      });

      setIsLoading(false);
    }, 1500);
  }, [isSZ, seed]);

  // feat: load a previous session from history
  const handleLoadHistory = useCallback((entry) => {
    setIsSZ(entry.isSZ);
    setSeed(entry.seed);
  }, []);

  return (
    <div className="app">
      {/* refactor: topbar is purely presentational */}
      <TopBar onAbout={() => setShowAbout(true)} />

      <div className="app-body">
        {/* feat: sidebar handles all user input */}
        <Sidebar
          isSZ={isSZ}
          setIsSZ={setIsSZ}
          seed={seed}
          setSeed={setSeed}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          sessionHistory={sessionHistory}
          onLoadHistory={handleLoadHistory}
        />

        {/* feat: main scrollable content area */}
        <main className="main-content">
          {!hasRun ? (
            // feat: empty state before first analysis
            <div className="empty-state">
              <div className="empty-icon">🧠</div>
              <h2>Ready to Analyze</h2>
              <p>Select subject type and click <strong>Analyze EEG</strong> to begin.</p>
            </div>
          ) : (
            <>
              {/* SECTION 1: Metric Cards */}
              <section className="section">
                <div className="section-label">Risk Assessment</div>
                <div className="metrics-row">
                  <MetricCard
                    title="RISK SCORE"
                    value={results.riskScore}
                    suffix="/100"
                    color={results.classification?.color}
                    isLoading={isLoading}
                    showBar
                    tooltip="Weighted deviation of delta, theta, alpha, and gamma from healthy baseline. Alpha suppression carries 35% weight."
                  />
                  <MetricCard
                    title="CONFIDENCE"
                    value={results.confidence}
                    suffix="%"
                    color="#7c3aed"
                    isLoading={isLoading}
                  />
                  <MetricCard
                    title="CLASSIFICATION"
                    value={results.classification?.level}
                    sub={results.classification?.recommendation}
                    color={results.classification?.color}
                    isLoading={isLoading}
                    isBadge
                  />
                  <MetricCard
                    title="KEY MARKER"
                    value={results.keyMarker}
                    sub={results.keyDeviation}
                    color="#f59e0b"
                    isLoading={isLoading}
                  />
                </div>
              </section>

              {/* SECTION 2: EEG Waveform */}
              <section className="section">
                <div className="section-label">EEG Signal Monitor</div>
                <EEGChart data={results.eegSignal} isLoading={isLoading} />
              </section>

              {/* SECTION 3: Band Power + Brain Map */}
              <section className="section">
                <div className="section-label">Frequency Analysis</div>
                <div className="two-col">
                  <BandPowerChart
                    bandPowers={results.bandPowers}
                    isLoading={isLoading}
                  />
                  <BrainMap
                    bandPowers={results.bandPowers}
                    isLoading={isLoading}
                  />
                </div>
              </section>

              {/* SECTION 4: SHAP Explainability */}
              <section className="section">
                <div className="section-label">AI Explainability</div>
                <SHAPChart
                  shapValues={results.shapValues}
                  isLoading={isLoading}
                />
              </section>

              {/* SECTION 5: Clinical Report */}
              <section className="section">
                <div className="section-label">Clinical Report</div>
                <ClinicalReport
                  results={results}
                  isSZ={isSZ}
                  isLoading={isLoading}
                />
              </section>
            </>
          )}
        </main>
      </div>

      {/* feat: about modal overlay */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}