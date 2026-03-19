import os
import sys
import logging
from dotenv import load_dotenv
from flask import Flask, jsonify
import traceback

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('test_flask')

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

try:
    # Create a minimal Flask app
    app = Flask(__name__)
    
    # Simple ping route
    @app.route('/api/ping', methods=['GET'])
    def ping():
        return jsonify({"status": "ok", "message": "Test Flask server is running"})
    
    # Simple error handler
    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    if __name__ == "__main__":
        host = os.environ.get('HOST', '0.0.0.0')
        port = int(os.environ.get('PORT', 5002))  # Use port 5002 to avoid conflicts
        debug = True
        
        # Check if port is already in use
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            logger.error(f"Port {port} is already in use. Cannot start server.")
            sys.exit(1)
        
        logger.info(f"Starting test Flask server on {host}:{port}")
        
        app.run(host=host, port=port, debug=debug, use_reloader=False)
        
except Exception as e:
    logger.error(f"Error during test: {str(e)}")
    logger.error(traceback.format_exc())