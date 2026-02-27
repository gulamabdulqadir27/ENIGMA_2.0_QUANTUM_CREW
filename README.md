# 🧠 NeuroScan AI

**EEG-Based Schizophrenia Early Risk Detection System**

A real-time EEG analysis dashboard built with React that simulates and visualizes brain signal data to detect early signs of schizophrenia. Supports both synthetic EEG simulation and real CSV data upload for clinical-grade frequency analysis.

> ⚠️ **Disclaimer:** This is a research/educational tool. It is **not** a certified medical device and should not be used for clinical diagnosis.

---

## ✨ Features

### 🔬 Dual Analysis Modes
- **Simulated EEG** — Generate synthetic 5-channel EEG signals using a seeded PRNG (Mulberry32) for reproducible results
- **CSV Upload** — Upload real EEG recordings (`.csv`) with columns `time, Fp1, F3, C3, P3, O1` for actual spectral analysis

### 📊 Dashboard Visualizations
| Section | Description |
|---|---|
| **Risk Assessment** | Risk score (0–100), confidence %, classification badge (Low/Moderate/High), and key biomarker |
| **EEG Signal Monitor** | Multi-channel waveform chart (Fp1, F3, C3, P3, O1) rendered with Recharts |
| **Frequency Analysis** | Band power bar chart (δ, θ, α, β, γ) + interactive cortical brain map |
| **AI Explainability** | SHAP-style feature importance chart showing which EEG features drive the risk score |
| **Clinical Report** | Automated findings summary, risk alerts, and clinical recommendations |

### 🧮 Signal Processing Pipeline
- **Goertzel Algorithm** — O(N)-per-frequency spectral power estimation (no FFT library needed)
- **Band Power Computation** — Standard EEG bands: Delta (0.5–4 Hz), Theta (4–8 Hz), Alpha (8–13 Hz), Beta (13–30 Hz), Gamma (30–50 Hz)
- **Weighted Risk Scoring** — Alpha suppression carries 35% weight (strongest schizophrenia marker), with delta (20%), theta (15%), and gamma (10%)
- **Frontal-Parietal Coherence** — Measures functional connectivity between brain regions (Fz-Pz, F3-P3, F4-P4)

### 🎨 UI / UX
- Dark theme with purple/blue gradient accents
- Skeleton loading animations during analysis
- Responsive layout (breakpoints at 1100px and 768px)
- Session history tracking (last 5 analyses)
- Drag-and-drop CSV upload with validation
- About modal with methodology details

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework (functional components + hooks) |
| **Recharts** | Charting library for EEG waveforms, bar charts, and SHAP plots |
| **Vanilla CSS** | Custom design system with CSS variables |
| **Google Fonts** | Inter (UI) + JetBrains Mono (data/monospace) |

---

## 📁 Project Structure

```
neuroscan-ai/
├── public/
│   └── index.html              # HTML shell with font imports
├── src/
│   ├── App.jsx                 # Root component — state management & analysis pipeline
│   ├── App.css                 # Global stylesheet (design tokens, layout, responsive)
│   ├── index.js                # React DOM entry point
│   ├── components/
│   │   ├── TopBar.jsx          # Fixed header with branding and disclaimer
│   │   ├── Sidebar.jsx         # Controls: subject type, seed, CSV upload, history
│   │   ├── MetricCard.jsx      # Reusable metric display card with loading states
│   │   ├── EEGChart.jsx        # Multi-channel EEG waveform visualization
│   │   ├── BandPowerChart.jsx  # Frequency band power bar chart
│   │   ├── BrainMap.jsx        # SVG cortical activity heatmap
│   │   ├── SHAPChart.jsx       # SHAP feature importance horizontal bar chart
│   │   ├── ClinicalReport.jsx  # Findings summary, alerts, and recommendations
│   │   └── AboutModal.jsx      # Methodology and disclaimer modal
│   └── utils/
│       ├── eegUtils.js         # Simulated EEG generation, band powers, risk scoring, SHAP, coherence
│       └── csvAnalysis.js      # CSV parsing, Goertzel algorithm, real-data analysis pipeline
├── test_healthy.csv            # Sample healthy subject EEG data
├── test_sz.csv                 # Sample schizophrenia subject EEG data
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 16
- **npm** ≥ 8

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/neuroscan-ai.git
cd neuroscan-ai

# Install dependencies
npm install
```

### Running Locally

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

---

## 📖 Usage Guide

### Simulated Mode
1. Select **Healthy Control** or **Schizophrenia (SZ)** from the sidebar
2. Optionally change the **Seed** value for different synthetic patients
3. Click **Analyze EEG** to run the simulation pipeline
4. Review results across all dashboard sections

### CSV Upload Mode
1. Click the **Upload CSV** drop zone in the sidebar (or drag & drop a file)
2. The CSV must contain columns: `time`, `Fp1`, `F3`, `C3`, `P3`, `O1`
3. Minimum **128 data rows** required (~0.5 seconds at 256 Hz)
4. Click **Analyze EEG** — the real data pipeline uses the Goertzel algorithm for spectral analysis
5. Click the **✕** button to clear the CSV and return to simulated mode

### Sample Data
Two test CSV files are included in the project root:
- `test_healthy.csv` — EEG recording from a healthy subject
- `test_sz.csv` — EEG recording from a schizophrenia subject

---

## 🧪 How It Works

### EEG Simulation (Synthetic Mode)
The simulator generates 5-channel EEG signals by summing sine waves at canonical frequencies (2 Hz delta, 6 Hz theta, 10 Hz alpha, 20 Hz beta, 40 Hz gamma) with seeded random amplitudes and phase offsets. Schizophrenia signals are modified based on clinical literature:

| Band | Healthy | Schizophrenia |
|---|---|---|
| **Delta** (0.5–4 Hz) | Baseline | ↑ Elevated (slow-wave invasion) |
| **Theta** (4–8 Hz) | Baseline | ↑ Elevated (cognitive slowing) |
| **Alpha** (8–13 Hz) | Baseline | ↓ Suppressed (key SZ marker) |
| **Beta** (13–30 Hz) | Baseline | Slightly reduced |
| **Gamma** (30–50 Hz) | Baseline | ↑ Dysregulated |

### Risk Score Formula
```
Risk = (δ deviation × 20) + (θ deviation × 15) + (α suppression × 35) + (γ deviation × 10)
```
Score is clamped to 0–100 and classified as:
- **Low Risk** (< 40) → Routine monitoring
- **Moderate** (40–59) → Follow-up evaluation
- **High Risk** (≥ 60) → Immediate psychiatric consultation

### CSV Analysis Pipeline
```
CSV Text → parseCSV() → signal[] → computeBandPowersFromSignal()
    → Goertzel algorithm at 1 Hz intervals per band
    → Normalize to healthy baseline scale (4.4 total)
    → computeRiskScore() → classifyRisk() → generateSHAP() → coherence
```

---

## 📜 License

This project is provided for educational and research purposes.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for:
- Improved signal processing algorithms
- Additional EEG channel support
- Real ML model integration
- UI/UX enhancements

---

<p align="center">
  Built with ❤️ using React
</p>
