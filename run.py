import os
import sys
import logging
import traceback
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

try:
    # Import create_app after environment variables are loaded
    from python_server.app import create_app
    
    app = create_app()
    
    if __name__ == "__main__":
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', 5001))  # Use port 5001 instead of 5000
        debug = True  # Enable debug mode for development
        
        logger.info(f"Starting QrMingle server on {host}:{port}")
        
        try:
            # Use threaded=True for better handling of concurrent requests
            app.run(host=host, port=port, debug=debug, use_reloader=False, threaded=True)
        except Exception as e:
            logger.error(f"Error running server: {str(e)}")
            logger.error(traceback.format_exc())
except Exception as e:
    logger.error(f"Error during server setup: {str(e)}")
    logger.error(traceback.format_exc())