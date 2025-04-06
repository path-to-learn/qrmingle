#!/bin/bash

# Set error handling
set -e

# Clean existing log files
echo "Cleaning logs..." > python_server.log

# Kill any existing Python processes
echo "Cleaning up any existing processes..."
pkill -f "python run.py" || true
sleep 2

# Start the Python server with detailed logging
echo "Starting Python server..."
python -u run.py >> python_server.log 2>&1 &
PYTHON_PID=$!
echo $PYTHON_PID > python_pid.txt
echo "Python server started with PID $PYTHON_PID"

# Give it time to initialize
echo "Waiting for server to initialize..."
sleep 10

# Check if the process is still running
if ! ps -p $PYTHON_PID > /dev/null; then
    echo "ERROR: Python server crashed during startup!"
    echo "Last 30 lines of log:"
    tail -n 30 python_server.log
    exit 1
fi

# Test that the Python server is responding
echo "Testing Python server..."
RESPONSE=$(curl -s -m 5 http://localhost:5001/api/ping || echo "Connection failed")
if [[ "$RESPONSE" != *"running"* ]]; then
    echo "ERROR: Python server not responding properly!"
    echo "Response: $RESPONSE"
    echo "Last 30 lines of log:"
    tail -n 30 python_server.log
    
    # Try to get any error messages from the process
    echo "Checking for errors in the Python process..."
    echo "Process status:"
    ps -p $PYTHON_PID -f || echo "Process no longer exists"
    
    exit 1
fi

echo "Python server is running on port 5001 with PID $PYTHON_PID"
echo "Starting Node.js server..."
echo "To view Python logs, use: tail -f python_server.log"
# Continue with the Node.js server in the foreground
npm run dev