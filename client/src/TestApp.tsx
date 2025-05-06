import React from 'react';

function TestApp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Test React App</h1>
        <p className="text-gray-600 mb-6">
          This is a minimal React component to test rendering
        </p>
      </div>
    </div>
  );
}

export default TestApp;