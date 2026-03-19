#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import signal
import threading
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('python_server.log')
    ]
)
logger = logging.getLogger('python_server_run')

def signal_handler(sig, frame):
    logger.info('Received signal to terminate')
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("Starting Python server with Gunicorn...")
    
    # Clean up previous logs
    try:
        if os.path.exists('gunicorn_access.log'):
            os.remove('gunicorn_access.log')
        if os.path.exists('gunicorn_error.log'):
            os.remove('gunicorn_error.log')
    except Exception as e:
        logger.error(f"Error cleaning logs: {str(e)}")
    
    try:
        cmd = [
            'gunicorn',
            '--bind', '0.0.0.0:5001',
            '--workers', '1',
            '--log-level', 'info',
            '--access-logfile', 'gunicorn_access.log',
            '--error-logfile', 'gunicorn_error.log',
            'python_server.app:create_app()'
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # Start the subprocess
        process = subprocess.Popen(cmd)
        
        # Define a heartbeat thread to check server status
        def heartbeat_thread():
            try:
                import requests
                while True:
                    try:
                        response = requests.get('http://localhost:5001/api/ping')
                        logger.info(f"Server heartbeat: {response.status_code} - {response.text}")
                    except Exception as e:
                        logger.warning(f"Heartbeat check failed: {str(e)}")
                    
                    time.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Heartbeat thread error: {str(e)}")
        
        # Start the heartbeat thread
        thread = threading.Thread(target=heartbeat_thread, daemon=True)
        thread.start()
        
        # Wait for process to complete
        process.wait()
        logger.info("Python server process completed")
        
    except Exception as e:
        logger.error(f"Error running Python server: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
