import os
import sys
from dotenv import load_dotenv

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import create_app after environment variables are loaded
from python_server.app import create_app

app = create_app()

if __name__ == "__main__":
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = True  # Enable debug mode for development
    
    print(f"Starting QrMingle server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)