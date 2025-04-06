import os
import sys
import logging
import traceback
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('test_python')

try:
    # Load environment variables
    load_dotenv()
    logger.info("Environment loaded")
    logger.info(f"Working directory: {os.getcwd()}")
    logger.info(f"Python version: {sys.version}")
    
    # Try to import and initialize key components
    logger.info("Testing Flask import...")
    from flask import Flask
    logger.info("Flask imported successfully")
    
    logger.info("Testing SQLAlchemy import...")
    from flask_sqlalchemy import SQLAlchemy
    logger.info("SQLAlchemy imported successfully")
    
    logger.info("Testing database connection...")
    db_url = os.environ.get('DATABASE_URL')
    logger.info(f"Database URL format check: {'postgresql' in db_url if db_url else 'No DATABASE_URL found'}")
    
    # Test basic database connection
    import psycopg2
    logger.info("Attempting direct database connection...")
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    logger.info("Database connection successful!")
    conn.close()
    
    # Test importing our model definitions
    logger.info("Testing model imports...")
    from python_server.models.models import db, User, Profile, SocialLink, ScanLog
    logger.info("Models imported successfully")
    
    # Test importing other key components
    logger.info("Testing other imports...")
    from python_server.auth.auth import hash_password, verify_password
    logger.info("Authentication functions imported successfully")
    
    logger.info("Testing complete - all looks good!")
    
except Exception as e:
    logger.error(f"Error during test: {str(e)}")
    logger.error(traceback.format_exc())
    
print("Test complete - check the logs above for details")