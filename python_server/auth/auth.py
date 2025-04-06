from flask import session, g, request
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

from python_server.models.models import User, db

def hash_password(password):
    """Hash a password for storing."""
    return generate_password_hash(password)

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    import logging
    logger = logging.getLogger('qrmingle.auth.password')
    logger.debug(f"Verifying password - Stored hash: {stored_password[:10]}... Provided length: {len(provided_password)}")
    # First parameter to check_password_hash must be the stored password hash
    # Second parameter is the plain text password provided by user
    result = check_password_hash(stored_password, provided_password)
    logger.debug(f"Password verification result: {result}")
    return result

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return {'error': 'Authentication required'}, 401
        user = User.query.get(session['user_id'])
        if not user:
            return {'error': 'User not found'}, 401
        g.user = user
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """Get the current authenticated user"""
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    return None

def is_effectively_premium(user):
    """Check if user is premium or in trial period"""
    if user.is_premium:
        return True
    
    if user.trial_expires_at and user.trial_expires_at > datetime.utcnow():
        return True
    
    return False

def start_premium_trial(user_id, days=7):
    """Start a premium trial for a user"""
    user = User.query.get(user_id)
    if not user:
        return None
    
    # Check if trial period is already set and active
    if user.trial_expires_at and user.trial_expires_at > datetime.utcnow():
        return user
    
    # Set trial period
    user.trial_expires_at = datetime.utcnow() + timedelta(days=days)
    db.session.commit()
    
    return user