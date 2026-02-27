// chore: app entry point — mounts React root to DOM
// docs: renders the root App component into the #root div in public/index.html
// ─────────────────────────────────────────────────────────────
// chore: React core imports
import React from "react";
import ReactDOM from "react-dom/client";
// chore: root application component
import App from "./App";

// feat: create React 18 root and render application
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);