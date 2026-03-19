import os
import sys
import logging
import traceback
import socket
import time
import signal
import faulthandler
from dotenv import load_dotenv

# Enable faulthandler to get better crash information
faulthandler.enable()

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("python_server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('qrmingle_run')

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Log startup information
logger.info("Starting QrMingle server setup")
logger.info(f"Python version: {sys.version}")
logger.info(f"Working directory: {os.getcwd()}")
logger.info(f"Environment variables: DATABASE_URL exists: {'DATABASE_URL' in os.environ}")
logger.info(f"Environment variables: SECRET_KEY exists: {'SECRET_KEY' in os.environ}")

# Setup signal handlers to help diagnose crashes
def signal_handler(sig, frame):
    logger.critical(f"Received signal {sig}, exiting gracefully")
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

# Check for other Python processes that might cause port conflicts
try:
    import psutil
    python_processes = [p for p in psutil.process_iter(['pid', 'name', 'cmdline']) 
                      if 'python' in p.info['name'].lower() and 'run.py' in ' '.join(p.info['cmdline'])]
    if len(python_processes) > 1:
        logger.warning(f"Other Python processes running that might cause conflicts: {python_processes}")
except ImportError:
    logger.info("psutil not available for process checking")
except Exception as e:
    logger.error(f"Error checking processes: {str(e)}")

# Check if port is already in use
try:
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5001))
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    
    if result == 0:
        logger.warning(f"Port {port} is already in use. This may cause issues.")
except Exception as e:
    logger.error(f"Error checking port availability: {str(e)}")

# Track the startup process with detailed steps
try:
    # Import create_app after environment variables are loaded
    logger.info("Step 1: Importing create_app...")
    from python_server.app import create_app
    
    logger.info("Step 2: Creating Flask app...")
    app = create_app()
    logger.info("Step 3: Flask app created successfully")
    
    if __name__ == "__main__":
        # Create a file to indicate we're running
        with open("python_server_running.txt", "w") as f:
            f.write("Running")
            
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', 5001))  # Use port 5001 instead of 5000
        debug = True  # Enable debug mode for development
        
        logger.info(f"Step 4: Starting QrMingle server on {host}:{port}")
        
        try:
            # Create a heartbeat mechanism to detect and report problems
            def heartbeat_thread():
                count = 0
                while True:
                    try:
                        time.sleep(10)
                        count += 1
                        logger.info(f"Server heartbeat check #{count}")
                        
                        # Try to connect to our own server to verify it's working
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.settimeout(2)
                        s.connect((host, port))
                        s.close()
                        logger.info(f"Server is responsive (heartbeat #{count})")
                        
                        # Write to a file that can be checked externally
                        with open("python_server_heartbeat.txt", "w") as f:
                            f.write(f"{time.time()}")
                    except Exception as e:
                        logger.error(f"Server heartbeat check #{count} failed: {str(e)}")
            
            try:
                import threading
                heartbeat = threading.Thread(target=heartbeat_thread, daemon=True)
                heartbeat.start()
                logger.info("Step 5: Heartbeat thread started")
            except Exception as e:
                logger.error(f"Failed to start heartbeat thread: {str(e)}")
                # Continue running even if heartbeat fails
            
            # Use the most reliable production-like settings 
            logger.info("Step 6: Starting Flask app.run() in production mode...")
            app.run(host=host, port=port, debug=False, use_reloader=False, threaded=True)
        except Exception as e:
            logger.critical(f"Error running server: {str(e)}")
            logger.critical(traceback.format_exc())
            # Make sure the error is visible
            with open("python_server_crash.txt", "w") as f:
                f.write(f"Server crashed: {str(e)}\n")
                f.write(traceback.format_exc())
            sys.exit(1)
except Exception as e:
    logger.critical(f"Error during server setup: {str(e)}")
    logger.critical(traceback.format_exc())
    # Make sure the error is visible
    with open("python_server_crash.txt", "w") as f:
        f.write(f"Setup crashed: {str(e)}\n")
        f.write(traceback.format_exc())
    sys.exit(1)