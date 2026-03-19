#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import signal

def signal_handler(sig, frame):
    print(f"Received signal {sig}, exiting...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

print("Starting Python Flask server with Gunicorn...")
try:
    # Start gunicorn server
    cmd = ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "1", "python_server.app:create_app()"]
    server = subprocess.Popen(cmd)
    print(f"Server started with PID {server.pid}")
    
    # Write PID to file
    with open("python_pid.txt", "w") as f:
        f.write(str(server.pid))
    
    # Keep script running
    while True:
        # Check if server is still running
        if server.poll() is not None:
            print("Server stopped unexpectedly!")
            break
        time.sleep(10)
        
except KeyboardInterrupt:
    print("Interrupted by user")
except Exception as e:
    print(f"Error: {str(e)}")
