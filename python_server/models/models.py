from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# Initialize SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_premium = db.Column(db.Boolean, default=False)
    stripe_customer_id = db.Column(db.String(255), nullable=True)
    trial_expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    profiles = db.relationship('Profile', backref='user', lazy=True, cascade='all, delete-orphan')
    
    # Properties for compatibility with JavaScript naming conventions
    @property
    def isPremium(self):
        return self.is_premium
        
    @property
    def stripeCustomerId(self):
        return self.stripe_customer_id
        
    @property
    def trialExpiresAt(self):
        return self.trial_expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'isPremium': self.is_premium,
            'stripeCustomerId': self.stripe_customer_id,
            'trialExpiresAt': self.trial_expires_at.isoformat() if self.trial_expires_at else None
        }

class Profile(db.Model):
    __tablename__ = 'profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    display_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)
    qr_style = db.Column(db.String(50), default='basic')
    qr_color = db.Column(db.String(20), default='#3B82F6')
    qr_size = db.Column(db.Integer, default=150)
    qr_position = db.Column(db.String(20), default='bottom')
    photo_position = db.Column(db.String(20), default='top')
    layout_style = db.Column(db.String(20), default='standard')
    slug = db.Column(db.String(100), unique=True, nullable=False)
    scan_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    social_links = db.relationship('SocialLink', backref='profile', lazy=True, cascade='all, delete-orphan')
    scan_logs = db.relationship('ScanLog', backref='profile', lazy=True, cascade='all, delete-orphan')
    
    # Properties for compatibility with JavaScript naming conventions
    @property
    def userId(self):
        return self.user_id
        
    @property
    def displayName(self):
        return self.display_name
        
    @property
    def photoUrl(self):
        return self.photo_url
        
    @property
    def qrStyle(self):
        return self.qr_style
        
    @property
    def qrColor(self):
        return self.qr_color
        
    @property
    def qrSize(self):
        return self.qr_size
        
    @property
    def qrPosition(self):
        return self.qr_position
        
    @property
    def photoPosition(self):
        return self.photo_position
        
    @property
    def layoutStyle(self):
        return self.layout_style
        
    @property
    def scanCount(self):
        return self.scan_count
        
    @property
    def createdAt(self):
        return self.created_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'displayName': self.display_name,
            'title': self.title,
            'bio': self.bio,
            'photoUrl': self.photo_url,
            'qrStyle': self.qr_style,
            'qrColor': self.qr_color,
            'qrSize': self.qr_size,
            'qrPosition': self.qr_position,
            'photoPosition': self.photo_position,
            'layoutStyle': self.layout_style,
            'slug': self.slug,
            'scanCount': self.scan_count,
            'createdAt': self.created_at.isoformat(),
            'socialLinks': [link.to_dict() for link in self.social_links]
        }

class SocialLink(db.Model):
    __tablename__ = 'social_links'
    
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    
    # Properties for compatibility with JavaScript naming conventions
    @property
    def profileId(self):
        return self.profile_id
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileId': self.profile_id,
            'platform': self.platform,
            'url': self.url
        }

class ScanLog(db.Model):
    __tablename__ = 'scan_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(100), nullable=True)
    device = db.Column(db.String(50), nullable=True)
    referrer = db.Column(db.String(255), nullable=True)
    
    # Properties for compatibility with JavaScript naming conventions
    @property
    def profileId(self):
        return self.profile_id
    
    @property
    def ipAddress(self):
        # This field is absent in the DB schema but is referenced in the code
        return None
    
    @property
    def userAgent(self):
        # This field is absent in the DB schema but is referenced in the code
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileId': self.profile_id,
            'timestamp': self.timestamp.isoformat(),
            'location': self.location,
            'device': self.device,
            'referrer': self.referrer,
            'ipAddress': None,  # These fields are absent in the DB schema
            'userAgent': None   # but included in the response for compatibility
        }

class Session(db.Model):
    __tablename__ = 'session'
    
    sid = db.Column(db.String(255), primary_key=True)
    sess = db.Column(db.Text, nullable=False)
    expire = db.Column(db.DateTime, nullable=False)
    
    def session_data(self):
        try:
            return json.loads(self.sess)
        except:
            return {}