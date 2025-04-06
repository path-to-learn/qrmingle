#!/bin/bash

# Start the Node.js server in the background
npm run dev &
NODE_PID=$!

# Start the Python server in the background
python run.py &
PYTHON_PID=$!

# Function to handle signals
cleanup() {
    echo "Stopping servers..."
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

# Register the cleanup function for signals
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Both servers started. Press Ctrl+C to stop both."
wait