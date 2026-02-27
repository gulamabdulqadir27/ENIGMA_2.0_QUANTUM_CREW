// feat: root app component with global state management
// docs: manages subject type, seed, analysis results, CSV upload, and session history
// docs: orchestrates the full EEG analysis pipeline (simulated or real CSV data)

// chore: React core imports
import React, { useState, useCallback } from "react";
// chore: UI component imports
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";
import EEGChart from "./components/EEGChart";
import BandPowerChart from "./components/BandPowerChart";
import BrainMap from "./components/BrainMap";
import SHAPChart from "./components/SHAPChart";
import ClinicalReport from "./components/ClinicalReport";
import AboutModal from "./components/AboutModal";
// chore: EEG simulation utilities
import {
  generateEEGSignal,
  computeBandPowers,
  computeRiskScore,
  generateSHAPValues,
  computeCoherence,
  classifyRisk,
} from "./utils/eegUtils";
// chore: CSV parsing and real-data analysis utilities
import { parseCSV, analyzeCSV } from "./utils/csvAnalysis";
// style: global stylesheet import
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

  // feat: CSV Upload state
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState(null);

  // feat: run full EEG analysis pipeline
  // perf: simulates 1.5s processing delay for realistic UX
  const handleAnalyze = useCallback(() => {
    setIsLoading(true);
    setHasRun(true);

    // chore: simulate async processing delay
    setTimeout(() => {
      let analysisResults;

      if (csvData) {
        // feat: analyze real uploaded CSV data (overrides simulation)
        analysisResults = analyzeCSV(csvData);
      } else {
        // feat: run synthetic simulation pipeline using seed + subject type
        const eegSignal = generateEEGSignal(isSZ, seed);
        const bandPowers = computeBandPowers(isSZ, seed);
        const { score, confidence, keyMarker, keyDeviation } = computeRiskScore(bandPowers, seed);
        const classification = classifyRisk(score);
        const shapValues = generateSHAPValues(isSZ, seed);
        const coherence = computeCoherence(isSZ, seed);

        analysisResults = {
          riskScore: score,
          confidence,
          keyMarker,
          keyDeviation,
          classification,
          eegSignal,
          bandPowers,
          shapValues,
          coherence,
        };
      }

      // feat: update results state
      setResults(analysisResults);

      // feat: add to session history (max 5 items, FIFO — oldest dropped)
      setSessionHistory((prev) => {
        const entry = {
          seed: csvData ? "CSV" : seed,
          isSZ: csvData ? (analysisResults.riskScore > 50) : isSZ,
          score: analysisResults.riskScore,
          level: analysisResults.classification.level,
          color: analysisResults.classification.color,
          time: new Date().toLocaleTimeString(),
        };
        return [entry, ...prev].slice(0, 5);
      });

      setIsLoading(false);
    }, 1500);
  }, [isSZ, seed, csvData]);

  // feat: CSV upload handler — receives already-read text + filename from Sidebar
  const handleCSVUpload = useCallback((text, fileName) => {
    const { signal, error } = parseCSV(text);
    if (error) {
      setCsvError(error);
      setCsvData(null);
      setCsvFileName("");
    } else {
      setCsvData(signal);
      setCsvFileName(fileName);
      setCsvError(null);
    }
  }, []);

  // feat: clear uploaded CSV and revert to simulated mode
  const handleCSVClear = useCallback(() => {
    setCsvData(null);
    setCsvFileName("");
    setCsvError(null);
  }, []);

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
          csvData={csvData}
          csvFileName={csvFileName}
          csvError={csvError}
          onCSVUpload={handleCSVUpload}
          onCSVClear={handleCSVClear}
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
              {/* feat: SECTION 1 — risk assessment metric cards */}
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

              {/* feat: SECTION 2 — multi-channel EEG waveform visualization */}
              <section className="section">
                <div className="section-label">EEG Signal Monitor</div>
                <EEGChart data={results.eegSignal} isLoading={isLoading} />
              </section>

              {/* feat: SECTION 3 — frequency band power chart + cortical activity map */}
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

              {/* feat: SECTION 4 — AI explainability via SHAP analysis */}
              <section className="section">
                <div className="section-label">AI Explainability</div>
                <SHAPChart
                  shapValues={results.shapValues}
                  isLoading={isLoading}
                />
              </section>

              {/* feat: SECTION 5 — clinical findings summary and recommendations */}
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