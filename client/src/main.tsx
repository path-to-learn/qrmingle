import React from "react";
import { createRoot } from "react-dom/client";
// Import TestApp instead of regular App for testing
import TestApp from "./TestApp";
import "./index.css";

// Use StrictMode to help catch issues
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
