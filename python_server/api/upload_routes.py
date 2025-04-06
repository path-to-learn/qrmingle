from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from python_server.auth.auth import login_required
import os
import logging
import uuid

# Configure logging
logger = logging.getLogger('qrmingle.uploads')

# Create blueprint
upload_routes = Blueprint('uploads', __name__, url_prefix='/api/uploads')

# Configure upload settings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi'}
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uploads'))

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_routes.route('/photo', methods=['POST'])
@login_required
def upload_photo():
    """Upload a profile photo"""
    try:
        # Check if folder exists, create if it doesn't
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Check if file part exists
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Check if file is allowed
        if not file and not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
            
        # Secure filename and generate unique name
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Generate URL
        file_url = f"/api/uploads/file/{unique_filename}"
        
        return jsonify({
            'success': True,
            'url': file_url,
            'filename': unique_filename
        })
        
    except Exception as e:
        logger.error(f"Error uploading photo: {str(e)}")
        return jsonify({'error': 'Failed to upload file'}), 500

@upload_routes.route('/video', methods=['POST'])
@login_required
def upload_video():
    """Upload a profile intro video"""
    try:
        # Check if folder exists, create if it doesn't
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Check if file part exists
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Check if file is allowed
        if not file and not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
            
        # Secure filename and generate unique name
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        # Only allow video extensions
        if ext not in ['mp4', 'mov', 'avi']:
            return jsonify({'error': 'File must be a video (mp4, mov, avi)'}), 400
            
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Save file
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Generate URL
        file_url = f"/api/uploads/file/{unique_filename}"
        
        return jsonify({
            'success': True,
            'url': file_url,
            'filename': unique_filename
        })
        
    except Exception as e:
        logger.error(f"Error uploading video: {str(e)}")
        return jsonify({'error': 'Failed to upload file'}), 500

@upload_routes.route('/file/<filename>', methods=['GET'])
def get_file(filename):
    """Serve uploaded files"""
    try:
        logger.info(f"Attempting to serve file {filename} from {UPLOAD_FOLDER}")
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        logger.error(f"Error serving file {filename}: {str(e)}")
        return jsonify({'error': 'File not found'}), 404