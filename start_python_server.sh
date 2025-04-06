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
sleep 5

# Check if the process is still running
if ! ps -p $PYTHON_PID > /dev/null; then
    echo "ERROR: Python server crashed during startup!"
    echo "Last 30 lines of log:"
    tail -n 30 python_server.log
    exit 1
fi

echo "Python server is running on port 5001 with PID $PYTHON_PID"
echo "To view Python logs, use: tail -f python_server.log"
