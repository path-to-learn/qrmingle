import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Hello World - Test Component</h1>
        <p className="text-gray-700">If you can see this, basic React rendering is working!</p>
      </div>
    </div>
  );
};

export default TestApp;