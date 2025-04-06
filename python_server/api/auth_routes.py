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
        data = request.get_json()
        user_data = UserLogin(**data)
        
        # Find user by username
        user = User.query.filter_by(username=user_data.username).first()
        
        # Check if user exists and password is correct
        if not user or not verify_password(user.password, user_data.password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Log user in
        session['user_id'] = user.id
        
        # Return user data
        return jsonify(UserResponse.model_validate(user).model_dump())
        
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