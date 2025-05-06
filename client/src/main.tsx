import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Use explicit React.createElement to avoid JSX transform issues
const app = React.createElement(App);
createRoot(document.getElementById("root")!).render(app);
