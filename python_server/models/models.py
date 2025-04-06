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
    isPremium = db.Column(db.Boolean, default=False)
    stripeCustomerId = db.Column(db.String(255), nullable=True)
    trialExpiresAt = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    profiles = db.relationship('Profile', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'isPremium': self.isPremium,
            'stripeCustomerId': self.stripeCustomerId,
            'trialExpiresAt': self.trialExpiresAt.isoformat() if self.trialExpiresAt else None
        }

class Profile(db.Model):
    __tablename__ = 'profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    displayName = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    photoUrl = db.Column(db.String(255), nullable=True)
    qrStyle = db.Column(db.String(50), default='basic')
    qrColor = db.Column(db.String(20), default='#3B82F6')
    qrSize = db.Column(db.Integer, default=150)
    qrPosition = db.Column(db.String(20), default='bottom')
    photoPosition = db.Column(db.String(20), default='top')
    layoutStyle = db.Column(db.String(20), default='standard')
    slug = db.Column(db.String(100), unique=True, nullable=False)
    scanCount = db.Column(db.Integer, default=0)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    social_links = db.relationship('SocialLink', backref='profile', lazy=True, cascade='all, delete-orphan')
    scan_logs = db.relationship('ScanLog', backref='profile', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.userId,
            'name': self.name,
            'displayName': self.displayName,
            'title': self.title,
            'bio': self.bio,
            'photoUrl': self.photoUrl,
            'qrStyle': self.qrStyle,
            'qrColor': self.qrColor,
            'qrSize': self.qrSize,
            'qrPosition': self.qrPosition,
            'photoPosition': self.photoPosition,
            'layoutStyle': self.layoutStyle,
            'slug': self.slug,
            'scanCount': self.scanCount,
            'createdAt': self.createdAt.isoformat(),
            'socialLinks': [link.to_dict() for link in self.social_links]
        }

class SocialLink(db.Model):
    __tablename__ = 'social_links'
    
    id = db.Column(db.Integer, primary_key=True)
    profileId = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileId': self.profileId,
            'platform': self.platform,
            'url': self.url
        }

class ScanLog(db.Model):
    __tablename__ = 'scan_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    profileId = db.Column(db.Integer, db.ForeignKey('profiles.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ipAddress = db.Column(db.String(45), nullable=True)
    userAgent = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    device = db.Column(db.String(50), nullable=True)
    referrer = db.Column(db.String(255), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileId': self.profileId,
            'timestamp': self.timestamp.isoformat(),
            'ipAddress': self.ipAddress,
            'userAgent': self.userAgent,
            'location': self.location,
            'device': self.device,
            'referrer': self.referrer
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