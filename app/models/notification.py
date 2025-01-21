from datetime import datetime, timezone
from . import db

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # User recevant la notification
    message = db.Column(db.String(500), nullable=False) 
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  
    is_read = db.Column(db.Boolean, default=False)  

    def __repr__(self):
        return f"<Notification(user_id={self.user_id}, message='{self.message}')>"