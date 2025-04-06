import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from python_server.models.models import db, Session as SessionModel
from python_server.api.auth_routes import auth_routes
from python_server.api.profile_routes import profile_routes
from python_server.api.upload_routes import upload_routes
from python_server.utils.helpers import create_demo_user
import logging
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('qrmingle')

def create_app():
    app = Flask(__name__, static_folder=None)
    
    # Configure CORS to allow requests from the React frontend
    CORS(app, supports_credentials=True)
    
    # Configure database
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure session
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')  # Fallback for development
    app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem instead of sqlalchemy to avoid table conflicts
    app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../session')
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_PERMANENT'] = True
    
    # Initialize database
    db.init_app(app)
    
    # Initialize session
    Session(app)
    
    # Register blueprints
    app.register_blueprint(auth_routes)
    app.register_blueprint(profile_routes)
    app.register_blueprint(upload_routes)
    
    # Create database tables if they don't exist
    with app.app_context():
        try:
            # Only create tables that don't exist
            db.create_all()
            logger.info("Database tables created or already exist")
            
            # Create demo user if no users exist
            create_demo_user()
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
    
    # Serve frontend files (in production)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join('../client/dist', path)):
            return send_from_directory('../client/dist', path)
        else:
            return send_from_directory('../client/dist', 'index.html')
    
    # Simple ping route to test server status
    @app.route('/api/ping', methods=['GET'])
    def ping():
        return jsonify({"status": "ok", "message": "Python server is running"})
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        logger.error(f"Server error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    return app

if __name__ == "__main__":
    app = create_app()
    # Use environment variables or fall back to defaults
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    
    # Start the server
    app.run(host=host, port=port, debug=True)