#!/bin/bash

# Set error handling
set -e

# Kill any existing gunicorn processes
echo "Cleaning up any existing processes..."
pkill -f "gunicorn" || true

# Wait a moment for processes to terminate
sleep 2

# Start the gunicorn server
echo "Starting Python server with gunicorn..."
nohup gunicorn --bind 0.0.0.0:5001 --workers 1 "python_server.app:create_app()" > gunicorn.log 2>&1 &

# Store the PID
echo $! > python_pid.txt
echo "Gunicorn started with PID $(cat python_pid.txt)"

# Wait for server to initialize
echo "Waiting for server to initialize..."
sleep 5

# Test if the server is responding
echo "Testing server with ping request..."
curl -s http://localhost:5001/api/ping && echo " - Server is operational!" || echo " - Server ping failed!"
