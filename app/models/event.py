from . import db 

class Event(db.Model): 
    __tablename__ = 'event'
    id = db.Column(db.Integer, primary_key = True) 
    title = db.Column(db.String(120), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    zoom_link = db.Column(db.String(500))
    budget = db.Column(db.Float)
    cost = db.Column(db.Float)
    description = db.Column(db.String(500))
    comments = db.Column(db.String(500))
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  
    priority = db.Column(db.String(50), nullable=False) 
    location = db.Column(db.String(150))

    marriage_details = db.relationship('MarriageEvent', uselist=False, backref='event', cascade="all, delete-orphan")
    party_details = db.relationship('PartyEvent', uselist=False, backref='event', cascade="all, delete-orphan")
    meeting_details = db.relationship('MeetingEvent', uselist=False, backref='event', cascade="all, delete-orphan")
    festival_details = db.relationship('FestivalEvent', uselist=False, backref='event', cascade="all, delete-orphan")

def __repr__(self): 
    return f'<Event {self.title}>'

class MarriageEvent(db.Model):
    __tablename__ = 'marriage_event'
    id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True)
    theme = db.Column(db.String(100))           # Thématique
    dress_code = db.Column(db.String(100))      # Code vestimentaire
    menu_specifications = db.Column(db.Text)    # Menu  modified
    programme_plan = db.Column(db.Text)           # Programme/Plan
    autre = db.Column(db.Text)                  # autre 

class PartyEvent(db.Model):
    __tablename__ = 'party_event'
    id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True)
    theme = db.Column(db.String(100))           # Thématique
    autre = db.Column(db.Text)                  # autre 

class MeetingEvent(db.Model):
    __tablename__ = 'meeting_event'
    id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True)
    duration = db.Column(db.Integer)            # Durée en minutes
    meeting_type = db.Column(db.String(100))    # Type de réunion
    plan = db.Column(db.Text)                   # Plan de la réunion
    autre = db.Column(db.Text)                  # autre 

class FestivalEvent(db.Model):
    __tablename__ = 'festival_event'
    id = db.Column(db.Integer, db.ForeignKey('event.id'), primary_key=True)
    theme = db.Column(db.String(100))           # Thématique
    price_per_person = db.Column(db.Float)      # Prix par personne
    planning = db.Column(db.Text)               # Planning de l'événement
    autre = db.Column(db.Text)                  # autre 
