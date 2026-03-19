#!/usr/bin/env python3
import os
import sys
import logging
import subprocess
import signal
import time
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("python_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('qrmingle_gunicorn')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Print startup information
logger.info("Starting QrMingle server via gunicorn")
logger.info(f"Python version: {sys.version}")
logger.info(f"Working directory: {os.getcwd()}")

# Define process variable globally
process = None

def signal_handler(sig, frame):
    logger.info(f"Received signal {sig}, exiting gracefully")
    global process
    if process:
        logger.info(f"Terminating gunicorn process {process.pid}")
        process.terminate()
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# Start gunicorn
cmd = [
    "gunicorn", 
    "--bind", "0.0.0.0:5001",
    "--workers", "1",
    "--log-level", "debug",
    "--access-logfile", "gunicorn_access.log",
    "--error-logfile", "gunicorn_error.log",
    "python_server.app:create_app()"
]

logger.info(f"Starting gunicorn with command: {' '.join(cmd)}")

try:
    # Write PID to file
    with open("python_pid.txt", "w") as f:
        f.write(str(os.getpid()))

    process = subprocess.Popen(cmd)
    logger.info(f"Gunicorn started with PID {process.pid}")
    
    # Wait for process to complete
    process.wait()
    
except Exception as e:
    logger.critical(f"Error running gunicorn: {str(e)}")
    with open("python_server_crash.txt", "w") as f:
        f.write(f"Error running gunicorn: {str(e)}")
    sys.exit(1)