import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto">
          <div className="bg-red-50 p-6 rounded-xl shadow-lg border border-red-200">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              There was an error rendering the application component.
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {this.state.error && this.state.error.toString()}
            </pre>
            <div className="mt-6">
              <a 
                href="/redirect.html"
                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Production Site
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified App for testing
function SimpleApp() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("SimpleApp component mounted");
    setIsLoaded(true);
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">QrMingle</h2>
        <p className="text-gray-600 mb-6">
          {isLoaded ? "React is working correctly!" : "Loading..."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a 
            href="/redirect.html" 
            className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Production Site
          </a>
          <a 
            href="/profile.html" 
            className="px-5 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Static Pages
          </a>
        </div>
      </div>
    </div>
  );
}

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SimpleApp />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
