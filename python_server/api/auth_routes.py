from flask import Blueprint, request, jsonify, session
from werkzeug.exceptions import BadRequest
from pydantic import ValidationError
from python_server.models.models import User, db
from python_server.schemas.schemas import UserCreate, UserLogin, UserResponse
from python_server.auth.auth import hash_password, verify_password, get_current_user
import logging

# Configure logging
logger = logging.getLogger('qrmingle.auth')

# Create blueprint
auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        user_data = UserCreate(**data)
        
        # Check if username already exists
        existing_user = User.query.filter_by(username=user_data.username).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create new user
        new_user = User(
            username=user_data.username,
            password=hash_password(user_data.password),
            is_premium=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Log user in
        session['user_id'] = new_user.id
        
        # Return user data
        return jsonify(UserResponse.model_validate(new_user).model_dump()), 201
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    try:
        logger.info("Login attempt received")
        
        # Debug request
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Load request data
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Validate request data
        user_data = UserLogin(**data)
        logger.info(f"Validated user data: username={user_data.username}, password length={len(user_data.password)}")
        
        # Find user by username
        user = User.query.filter_by(username=user_data.username).first()
        
        # Check if user exists
        if not user:
            logger.error(f"Login failed: Username '{user_data.username}' not found")
            return jsonify({'error': 'Invalid username or password'}), 401
        
        logger.info(f"User found: id={user.id}, username={user.username}")
        
        # Debug password verification
        logger.info(f"Stored password hash: {user.password}")
        logger.info(f"User provided password: {user_data.password}")
        
        # Parameters should be (stored_password, provided_password)
        try:
            password_correct = verify_password(user.password, user_data.password)
            logger.info(f"Password verification for '{user_data.username}': {password_correct}")
        except Exception as e:
            logger.error(f"Password verification exception: {str(e)}")
            logger.error(f"Exception details:", exc_info=True)
            return jsonify({'error': 'Authentication error'}), 500
        
        if not password_correct:
            logger.error(f"Login failed: Incorrect password for '{user_data.username}'")
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Log user in
        try:
            session['user_id'] = user.id
            logger.info(f"User logged in: id={user.id}, session_id={session.sid if hasattr(session, 'sid') else 'unknown'}")
        except Exception as e:
            logger.error(f"Session assignment error: {str(e)}")
            logger.error(f"Session assignment exception details:", exc_info=True)
            return jsonify({'error': 'Session error'}), 500
        
        # Return user data
        try:
            user_response = UserResponse.model_validate(user).model_dump()
            logger.info(f"Login successful: {user_response}")
            return jsonify(user_response)
        except Exception as e:
            logger.error(f"Response serialization error: {str(e)}")
            logger.error(f"Exception details:", exc_info=True)
            return jsonify({'error': 'Response error'}), 500
        
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_routes.route('/logout', methods=['POST'])
def logout():
    # Clear session
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@auth_routes.route('/validate', methods=['GET'])
def validate():
    # Get current user
    user = get_current_user()
    
    if not user:
        return jsonify({'message': 'Not authenticated'}), 401
    
    # Return user data
    return jsonify(UserResponse.model_validate(user).model_dump())