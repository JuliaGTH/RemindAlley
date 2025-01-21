from flask import render_template, request, redirect, url_for,flash, Blueprint, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime
from ..models import db, User 


auth_bp  = Blueprint('auth', __name__)

# Route qui amene vers la page d'acceuil 
@auth_bp.route('/index')
def index():
    return render_template('index.html')


# Route qui permet a l'utilisateur de se connecter 
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('user.user_dashboard', user_id=current_user.id))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user:  #user.check_password(password)
            if user.is_active == False : # si le compte est desactivé
                flash("Votre compte a été désactivé.\n Contactez le support.")
                return render_template('login.html')

            if user.password_hash == password :    # si le mot de passe est juste
                user.reset_login_attempts()     # Réinitialise à zero les tentatives en cas de connexion réussie
                login_user(user)
                return redirect(url_for('user.user_dashboard', user_id=user.id)) 

            elif user.is_active == True :
                # Incrémente les tentatives de connexion à chaque fois qu'un mot de passe est erroné
                user.login_attempts += 1
                db.session.commit()

                # Désactiver le compte après 6 tentatives échouées
                if  user.login_attempts > 5:
                    user.deactivate()
                    flash("Votre compte a été désactivé après plusieurs tentatives infructueuses.")
                else:
                    flash("Mot de passe incorrect. \nTentative(s) restante(s) : " + str(6 - user.login_attempts))

        else:
            flash('Mauvaises informations. Veuillez réessayer!', 'danger')

    return render_template('login.html')


# Route qui permet de creer un compte pour le site Web 
@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        family_name = request.form.get('family_name')
        name = request.form.get('name')
        phone_number = request.form.get('phone_number')
        dateOfBirth = request.form.get('dateOfBirth')
        email = request.form.get('email')
        password = request.form.get('password')

        date_of_birth = datetime.strptime(dateOfBirth, "%Y-%m-%d").date()

        # Vérification des champs manquants (important pour les att. non nuls.)
        if not family_name or not name or not email:
            flash('Tous les champs sont obligatoires!', 'danger')
            return redirect(url_for('auth.signup'))

        new_user = User(username=username, family_name=family_name, name=name, phone_number=phone_number, dateOfBirth=date_of_birth, email=email, password_hash=password,)
        #new_user.set_password(password)  # Hacher le mot de passe avant de l'ajouter

        db.session.add(new_user)
        db.session.commit()
        flash('Utilisateur crée avec succès!', 'success')
        return redirect(url_for('auth.login'))

    return render_template('signup.html')


# Route pour la deconnexion 
@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.index'))


# Route qui permet de recuperer un mot de passe en cas d'oubli 
@auth_bp.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
        else:
            email = request.form.get('email')
        
        user = User.query.filter_by(email=email).first()
        if user:
            if request.is_json:
                return {'success': True, 'password': user.password_hash}, 200
            else:
                flash(f'Votre mot de passe est : {user.password_hash}', 'info')
        else:
            if request.is_json:
                return {'success': False, 'message': 'Adresse email non trouvée'}, 404
            else:
                flash('Adresse e-mail introuvable', 'danger')

    return render_template('forgot_password.html')


# Route qui permet de recuperer le courriel en cas d'oubli 
@auth_bp.route('/forgot_email', methods=['GET', 'POST'])
def forgot_email():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
        else:
            username = request.form.get('username')
        
        user = User.query.filter_by(username=username).first()
        if user:
            if request.is_json:
                return {'success': True, 'username': user.email}, 200
            else:
                flash(f'Votre courriel est : {user.email}', 'info')
        else:
            if request.is_json:
                return {'success': False, 'message': 'Adresse email non trouvée'}, 404
            else:
                flash('Adresse e-mail introuvable', 'danger')

    return render_template('forgot_email.html')


# Route qui amene vers le table de bord d'utilisateur 
@auth_bp.route('/user_dashboard')
def dashboard():
    return render_template('user_dashboard.html', name=current_user.username)
