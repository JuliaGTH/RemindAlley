# models/__init__.py
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

db = SQLAlchemy()  # Create the SQLAlchemy instance

from .user import User
from .event import Event, PartyEvent, MarriageEvent, MeetingEvent, FestivalEvent
from .invitation import Invitation
from .notification import Notification 