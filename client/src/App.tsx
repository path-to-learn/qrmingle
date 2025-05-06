import React from "react";

// Simple test app to verify React is working without JSX
function App() {
  // Using React.createElement instead of JSX to avoid transform issues
  return React.createElement(
    "div", 
    { className: "min-h-screen flex items-center justify-center bg-blue-50" },
    React.createElement(
      "div", 
      { className: "bg-white p-8 rounded-xl shadow-lg max-w-md w-full" },
      React.createElement(
        "h1", 
        { className: "text-3xl font-bold text-blue-600 mb-4" }, 
        "QrMingle"
      ),
      React.createElement(
        "p", 
        { className: "text-gray-600 mb-6" }, 
        "React is now working! This is a simple test page to verify that React rendering is functioning correctly."
      ),
      React.createElement(
        "p", 
        { className: "text-sm text-gray-500" }, 
        "We've temporarily simplified the app to fix rendering issues. Your data is still in the database."
      )
    )
  );
}

export default App;
