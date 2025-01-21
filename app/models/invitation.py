from . import db 
from .user import User
from .event import Event

class Invitation(db.Model):
    __tablename__ = 'invitations'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True)

def get_potential_invitees(event):
    # Obtenir tous les utilisateurs à l'exclusion du propriétaire de l'événement et des invités actuels
    potential_invitees = User.query.filter(
        User.id != event.owner_id,
        User.id.notin_([user.id for user in event.invited_users])
    ).all()
    return potential_invitees

def __repr__(self):
    return f'<Invitation user_id={self.user_id}, event_id={self.event_id}>'