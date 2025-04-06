import os
import sys
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('qrmingle_run')

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import create_app after environment variables are loaded
from python_server.app import create_app

app = create_app()

if __name__ == "__main__":
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5001))  # Use port 5001 instead of 5000
    debug = True  # Enable debug mode for development
    
    logger.info(f"Starting QrMingle server on {host}:{port}")
    
    try:
        app.run(host=host, port=port, debug=debug)
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())