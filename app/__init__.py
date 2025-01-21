from flask import Flask, render_template
from flask_login import LoginManager, current_user
#from flask import Flask
#from flask_wtf import CSRFProtect
from .routes.auth import auth_bp
from .routes.user import user_bp
from .models import db
from .models import User, Notification

def create_app(): 
    app = Flask(__name__)

    login_manager = LoginManager()
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))  

    # Route pour page index 
    @app.route('/')
    def index():
        return render_template('index.html')
    
    @app.route('/recreate_db', methods=['GET'])
    def recreate_db():
        db.drop_all()  # Drop tous les tables de la BD
        db.create_all()  # Create tous les tables de la BD
        return "Database recreated successfully!", 200

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///remindalleydatabase.db' 
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = '\xccd\x9c\xb8\xd9?\x80\x92\xd1\xfb\xa1a\x80\xfd"W\xc5\x8b\\K\xce?\xfc\x9c' 
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/user')

    with app.app_context():
        # Register the context processor
        @app.context_processor
        def inject_notification_count():
            if current_user.is_authenticated:
                unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
                return dict(unread_count=unread_count)
            return dict(unread_count=0)
        #recreate_db()
        db.create_all()  # Création de toutes les tables définies par les modèles
    return app 