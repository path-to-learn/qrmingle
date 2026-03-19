#!/bin/bash

# Set error handling
set -e

# Clean existing log files and crash files
echo "Cleaning logs and crash files..."
echo "Cleaning logs..." > python_server.log
rm -f python_server_crash.txt python_server_running.txt python_server_heartbeat.txt

# Kill any existing Python processes
echo "Cleaning up any existing processes..."
pkill -f "python run.py" || true
sleep 2

# Start the Python server with detailed logging
echo "Starting Python server with extended diagnostics..."
python -u run.py >> python_server.log 2>&1 &
PYTHON_PID=$!
echo $PYTHON_PID > python_pid.txt
echo "Python server started with PID $PYTHON_PID"

# Give it time to initialize
echo "Waiting for server to initialize..."
sleep 10

# Check if any crash files were created
if [ -f python_server_crash.txt ]; then
    echo "ERROR: Python server crashed and created crash file!"
    echo "===== Crash file contents ====="
    cat python_server_crash.txt
    echo "===== End crash file ====="
    echo "Last 50 lines of log:"
    tail -n 50 python_server.log
    exit 1
fi

# Check if the process is still running
if ! ps -p $PYTHON_PID > /dev/null; then
    echo "ERROR: Python server crashed during startup!"
    echo "Last 50 lines of log:"
    tail -n 50 python_server.log
    
    # Check for common issues
    echo "Checking for common issues..."
    
    # Check if port 5001 is already in use
    if nc -z 127.0.0.1 5001 2>/dev/null; then
        echo "Port 5001 is already in use! This could be causing the crash."
    fi
    
    # Check if database connection works
    echo "Checking database connection..."
    psql $DATABASE_URL -c "SELECT 1" >/dev/null 2>&1 && echo "Database connection OK" || echo "Database connection FAILED"
    
    exit 1
fi

echo "Python server is running on port 5001 with PID $PYTHON_PID"
echo "To view Python logs, use: tail -f python_server.log"

# Test server with a simple request
echo "Testing server with a ping request..."
curl -s http://localhost:5001/api/ping || echo "Server ping test failed!"
