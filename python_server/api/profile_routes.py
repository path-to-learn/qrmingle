from flask import Blueprint, request, jsonify, g
from werkzeug.exceptions import BadRequest, NotFound
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from python_server.models.models import Profile, SocialLink, ScanLog, db
from python_server.schemas.schemas import ProfileCreate, ProfileUpdate, ProfileResponse, ScanLogCreate
from python_server.auth.auth import login_required, get_current_user, is_effectively_premium
import logging
import re
import time
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger('qrmingle.profiles')

# Create blueprint
profile_routes = Blueprint('profiles', __name__, url_prefix='/api/profiles')

def generate_slug(name):
    """Generate a URL-friendly slug from a name"""
    # Remove special chars and replace spaces with hyphens
    slug = re.sub(r'[^a-zA-Z0-9\s]', '', name).lower()
    slug = re.sub(r'\s+', '-', slug)
    # Add timestamp to ensure uniqueness
    return f"{slug}-{int(time.time())}"

@profile_routes.route('', methods=['GET'])
@login_required
def get_profiles():
    """Get all profiles for the current user"""
    try:
        user = g.user
        profiles = Profile.query.filter_by(userId=user.id).all()
        
        # Convert to response format
        response_data = [ProfileResponse.model_validate(profile).model_dump() for profile in profiles]
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error fetching profiles: {str(e)}")
        return jsonify({'error': 'Failed to fetch profiles'}), 500

@profile_routes.route('/<int:profile_id>', methods=['GET'])
@login_required
def get_profile(profile_id):
    """Get a specific profile by ID"""
    try:
        user = g.user
        profile = Profile.query.get(profile_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        # Ensure user owns this profile
        if profile.userId != user.id:
            return jsonify({'error': 'Unauthorized access to profile'}), 403
            
        # Convert to response format
        response_data = ProfileResponse.model_validate(profile).model_dump()
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error fetching profile {profile_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

@profile_routes.route('/slug/<slug>', methods=['GET'])
def get_profile_by_slug(slug):
    """Get a public profile by slug - no authentication required"""
    try:
        profile = Profile.query.filter_by(slug=slug).first()
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        # Increment scan count
        profile.scanCount += 1
        
        # Log scan if needed
        try:
            scan_data = {
                'ipAddress': request.remote_addr,
                'userAgent': request.headers.get('User-Agent'),
                'referrer': request.headers.get('Referer')
            }
            
            # Create scan log
            scan_log = ScanLog(
                profileId=profile.id,
                **scan_data
            )
            db.session.add(scan_log)
        except Exception as log_error:
            # Don't fail if logging fails
            logger.error(f"Failed to log scan: {str(log_error)}")
        
        db.session.commit()
        
        # Convert to response format
        response_data = ProfileResponse.model_validate(profile).model_dump()
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error fetching profile by slug {slug}: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

@profile_routes.route('', methods=['POST'])
@login_required
def create_profile():
    """Create a new profile"""
    try:
        user = g.user
        data = request.get_json()
        
        # Check profile limit for non-premium users
        if not is_effectively_premium(user):
            existing_profiles_count = Profile.query.filter_by(userId=user.id).count()
            if existing_profiles_count >= 3:  # Free tier limit
                return jsonify({
                    'error': 'Profile limit reached',
                    'message': 'Free users can create up to 3 profiles. Upgrade to premium for unlimited profiles.'
                }), 403
        
        # Validate input data
        profile_data = ProfileCreate(**data)
        
        # Generate slug if not provided
        if not profile_data.slug:
            profile_data.slug = generate_slug(profile_data.name)
        else:
            # Check if slug is unique
            existing_profile = Profile.query.filter_by(slug=profile_data.slug).first()
            if existing_profile:
                return jsonify({'error': 'Slug already in use'}), 400
        
        # Create profile
        profile = Profile(
            userId=user.id,
            name=profile_data.name,
            displayName=profile_data.displayName,
            title=profile_data.title,
            bio=profile_data.bio,
            photoUrl=profile_data.photoUrl,
            qrStyle=profile_data.qrStyle,
            qrColor=profile_data.qrColor,
            qrSize=profile_data.qrSize,
            qrPosition=profile_data.qrPosition,
            photoPosition=profile_data.photoPosition,
            layoutStyle=profile_data.layoutStyle,
            slug=profile_data.slug
        )
        
        db.session.add(profile)
        db.session.flush()  # Get ID without committing
        
        # Add social links
        for link_data in profile_data.socialLinks:
            social_link = SocialLink(
                profileId=profile.id,
                platform=link_data.platform,
                url=link_data.url
            )
            db.session.add(social_link)
        
        db.session.commit()
        
        # Get complete profile with social links
        db.session.refresh(profile)
        
        # Convert to response format
        response_data = ProfileResponse.model_validate(profile).model_dump()
        return jsonify(response_data), 201
    
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to create profile'}), 500

@profile_routes.route('/<int:profile_id>', methods=['PATCH'])
@login_required
def update_profile(profile_id):
    """Update an existing profile"""
    try:
        user = g.user
        data = request.get_json()
        
        # Validate input data
        profile_update = ProfileUpdate(**data)
        
        # Get existing profile
        profile = Profile.query.get(profile_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        # Ensure user owns this profile
        if profile.userId != user.id:
            return jsonify({'error': 'Unauthorized access to profile'}), 403
        
        # Update profile fields if provided
        if profile_update.name is not None:
            profile.name = profile_update.name
        if profile_update.displayName is not None:
            profile.displayName = profile_update.displayName
        if profile_update.title is not None:
            profile.title = profile_update.title
        if profile_update.bio is not None:
            profile.bio = profile_update.bio
        if profile_update.photoUrl is not None:
            profile.photoUrl = profile_update.photoUrl
        if profile_update.qrStyle is not None:
            profile.qrStyle = profile_update.qrStyle
        if profile_update.qrColor is not None:
            profile.qrColor = profile_update.qrColor
        if profile_update.qrSize is not None:
            profile.qrSize = profile_update.qrSize
        if profile_update.qrPosition is not None:
            profile.qrPosition = profile_update.qrPosition
        if profile_update.photoPosition is not None:
            profile.photoPosition = profile_update.photoPosition
        if profile_update.layoutStyle is not None:
            profile.layoutStyle = profile_update.layoutStyle
        
        # Update social links if provided
        if profile_update.socialLinks is not None:
            # Delete existing links
            SocialLink.query.filter_by(profileId=profile.id).delete()
            
            # Add new links
            for link_data in profile_update.socialLinks:
                social_link = SocialLink(
                    profileId=profile.id,
                    platform=link_data.platform,
                    url=link_data.url
                )
                db.session.add(social_link)
        
        db.session.commit()
        
        # Get updated profile with social links
        db.session.refresh(profile)
        
        # Convert to response format
        response_data = ProfileResponse.model_validate(profile).model_dump()
        return jsonify(response_data)
    
    except ValidationError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error updating profile {profile_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@profile_routes.route('/<int:profile_id>', methods=['DELETE'])
@login_required
def delete_profile(profile_id):
    """Delete a profile"""
    try:
        user = g.user
        
        # Get existing profile
        profile = Profile.query.get(profile_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        # Ensure user owns this profile
        if profile.userId != user.id:
            return jsonify({'error': 'Unauthorized access to profile'}), 403
        
        # Delete the profile (cascade will handle related entities)
        db.session.delete(profile)
        db.session.commit()
        
        return jsonify({'message': 'Profile deleted successfully'})
    
    except Exception as e:
        logger.error(f"Error deleting profile {profile_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to delete profile'}), 500

@profile_routes.route('/<int:profile_id>/analytics', methods=['GET'])
@login_required
def get_profile_analytics(profile_id):
    """Get analytics for a profile"""
    try:
        user = g.user
        
        # Get existing profile
        profile = Profile.query.get(profile_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
            
        # Ensure user owns this profile
        if profile.userId != user.id:
            return jsonify({'error': 'Unauthorized access to profile'}), 403
        
        # Get scan logs
        scan_logs = ScanLog.query.filter_by(profileId=profile_id).order_by(ScanLog.timestamp.desc()).all()
        
        # Basic analytics
        total_scans = len(scan_logs)
        
        # Recent scans (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_scans = [log for log in scan_logs if log.timestamp >= thirty_days_ago]
        recent_scans_count = len(recent_scans)
        
        # Device breakdown
        devices = {}
        for log in scan_logs:
            if log.device:
                devices[log.device] = devices.get(log.device, 0) + 1
        
        # Location breakdown
        locations = {}
        for log in scan_logs:
            if log.location:
                locations[log.location] = locations.get(log.location, 0) + 1
        
        # Daily scan counts
        daily_scans = {}
        for log in scan_logs:
            day = log.timestamp.strftime('%Y-%m-%d')
            daily_scans[day] = daily_scans.get(day, 0) + 1
        
        analytics = {
            'totalScans': total_scans,
            'recentScans': recent_scans_count,
            'devices': devices,
            'locations': locations,
            'dailyScans': daily_scans,
            'scanLogs': [log.to_dict() for log in scan_logs[:50]]  # Limited to 50 most recent logs
        }
        
        return jsonify(analytics)
    
    except Exception as e:
        logger.error(f"Error getting analytics for profile {profile_id}: {str(e)}")
        return jsonify({'error': 'Failed to get analytics'}), 500