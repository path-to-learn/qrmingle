function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">QrMingle</h1>
        <p className="text-center mb-4">
          Welcome to QrMingle - The digital networking platform
        </p>
        <div className="flex justify-center">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            onClick={() => alert('Button clicked!')}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
