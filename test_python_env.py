import os
import sys
import logging
import traceback
import socket
import json
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("test_python_env.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('test_python')

logger.info("==================== ENVIRONMENT TEST START ====================")
logger.info(f"Test started at: {datetime.now().isoformat()}")

try:
    # Load environment variables
    load_dotenv()
    logger.info("Environment loaded")
    logger.info(f"Working directory: {os.getcwd()}")
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Environment: DATABASE_URL exists: {'DATABASE_URL' in os.environ}")
    logger.info(f"Environment: SECRET_KEY exists: {'SECRET_KEY' in os.environ}")
    
    # Check for running services and system resources
    try:
        import psutil
        
        # Check for Python processes
        python_processes = [p for p in psutil.process_iter(['pid', 'name', 'cmdline']) 
                          if 'python' in p.info['name'].lower()]
        
        logger.info(f"Number of Python processes running: {len(python_processes)}")
        for proc in python_processes:
            cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else 'Unknown'
            logger.info(f"PID: {proc.info['pid']}, Command: {cmdline[:100]}")
        
        # Check system resources
        virtual_memory = psutil.virtual_memory()
        logger.info(f"Memory usage: {virtual_memory.percent}% (Total: {virtual_memory.total / (1024**3):.2f} GB)")
        
        cpu_percent = psutil.cpu_percent(interval=1)
        logger.info(f"CPU usage: {cpu_percent}%")
        
    except ImportError:
        logger.info("psutil not available for process checking")
    except Exception as e:
        logger.error(f"Error checking system resources: {str(e)}")

    # Test if port 5001 is in use
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('127.0.0.1', 5001))
        if result == 0:
            logger.info("Port 5001 is open - a service is running on it")
        else:
            logger.info("Port 5001 is not in use")
        sock.close()
    except Exception as e:
        logger.error(f"Error checking port: {str(e)}")
    
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
    
    # List tables
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = cur.fetchall()
    table_names = [table[0] for table in tables]
    logger.info(f"Found tables: {', '.join(table_names)}")
    cur.close()
    
    conn.close()
    
    # Test importing our model definitions
    logger.info("Testing model imports...")
    from python_server.models.models import db, User, Profile, SocialLink, ScanLog
    logger.info("Models imported successfully")
    
    # Test importing other key components
    logger.info("Testing other imports...")
    from python_server.auth.auth import hash_password, verify_password
    logger.info("Authentication functions imported successfully")
    
    # Test a sample password hash and verification
    test_password = "testpassword"
    logger.info("Testing password hashing and verification...")
    hashed = hash_password(test_password)
    logger.info(f"Password hashed successfully: {hashed[:20]}...")
    is_valid = verify_password(hashed, test_password)
    logger.info(f"Password verification result: {is_valid}")
    
    logger.info("Testing complete - all looks good!")
    
except Exception as e:
    logger.error(f"Error during test: {str(e)}")
    logger.error(traceback.format_exc())

logger.info("==================== ENVIRONMENT TEST END ====================")
print("Test complete - check the logs above for details")