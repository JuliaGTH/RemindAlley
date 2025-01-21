from . import db 
#from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model): 
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    family_name = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone_number = db.Column(db.String(150), unique=True, nullable=False)
    dateOfBirth = db.Column(db.Date, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    is_active = db.Column(db.Boolean, default=True)  
    login_attempts = db.Column(db.Integer, default=0)  
    events = db.relationship('Event', backref='owner', lazy=True)
    invited_events = db.relationship('Event', secondary='invitations', backref='invited_users')

    # def set_password(self, password):
    #         self.password_hash = generate_password_hash(password)

    # def check_password(self, password):
    #     return check_password_hash(self.password_hash, password)

    def get_id(self):
        return self.id

    @property
    def is_authenticated(self):
        return True

    def __repr__(self): 
        return f'<User {self.username}>'


    """Désactive le compte utilisateur."""
    def deactivate(self):
        self.is_active = False
        db.session.commit()

    """Réinitialise le compteur de tentatives de connexion lorsqu'une connexion réussit """
    def reset_login_attempts(self):
        self.login_attempts = 0
        db.session.commit()