#!/bin/bash
# Script to run the Python server with gunicorn

# Clean up previous runs
echo "Cleaning up previous runs..."
rm -f python_server_crash.txt gunicorn_access.log gunicorn_error.log
echo "Starting Python server log..." > python_server.log

# Start the server
echo "Starting Python server with gunicorn..."
gunicorn --bind 0.0.0.0:5001 --workers 1 "python_server.app:create_app()"
