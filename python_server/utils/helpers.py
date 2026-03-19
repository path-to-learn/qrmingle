from python_server.models.models import User, db
from python_server.auth.auth import hash_password
import logging

# Configure logging
logger = logging.getLogger('qrmingle.utils')

def create_demo_user():
    """Create a demo user if no users exist in the database"""
    try:
        # Check if any users exist
        users_count = User.query.count()
        
        if users_count == 0:
            logger.info("No users found, creating demo user")
            
            # Create demo user with proper password hashing
            hashed_password = hash_password("demo")
            logger.info(f"Hashed password format: {hashed_password[:20]}...")
            
            demo_user = User(
                username="demo",
                password=hashed_password,
                is_premium=False
            )
            
            db.session.add(demo_user)
            db.session.commit()
            
            logger.info(f"Created demo user with username 'demo' and password 'demo'")
            return True
        
        return False
    
    except Exception as e:
        logger.error(f"Error creating demo user: {str(e)}")
        return False