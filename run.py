import os
import sys
import logging
import traceback
import socket
import time
from dotenv import load_dotenv

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

try:
    # Import create_app after environment variables are loaded
    logger.info("Importing create_app...")
    from python_server.app import create_app
    
    logger.info("Creating Flask app...")
    app = create_app()
    logger.info("Flask app created successfully")
    
    if __name__ == "__main__":
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', 5001))  # Use port 5001 instead of 5000
        debug = True  # Enable debug mode for development
        
        logger.info(f"Starting QrMingle server on {host}:{port}")
        
        try:
            # Create a heartbeat mechanism to detect and report problems
            def heartbeat_thread():
                while True:
                    time.sleep(10)
                    logger.info("Server heartbeat check")
                    try:
                        # Try to connect to our own server to verify it's working
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.settimeout(2)
                        s.connect((host, port))
                        s.close()
                        logger.info("Server is responsive")
                    except Exception as e:
                        logger.error(f"Server heartbeat check failed: {str(e)}")
            
            import threading
            threading.Thread(target=heartbeat_thread, daemon=True).start()
            
            # Use threaded=True for better handling of concurrent requests
            logger.info("Starting Flask app.run()...")
            app.run(host=host, port=port, debug=debug, use_reloader=False, threaded=True)
        except Exception as e:
            logger.error(f"Error running server: {str(e)}")
            logger.error(traceback.format_exc())
except Exception as e:
    logger.error(f"Error during server setup: {str(e)}")
    logger.error(traceback.format_exc())