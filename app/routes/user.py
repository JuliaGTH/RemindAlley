from flask import render_template, request, redirect, url_for,flash, Blueprint, jsonify, request
from ..models import db, User, Event, PartyEvent, MarriageEvent, MeetingEvent, FestivalEvent, Invitation, Notification
from flask_login import current_user, login_required
from datetime import datetime

user_bp  = Blueprint('user', __name__)

# Route pour afficher le tableau de bord d'utilisateur 
@user_bp.route('/user/<int:user_id>/dashboard')
def user_dashboard(user_id):
    user = User.query.get(user_id)
    if user is None:
        return "Utilisateur non trouvé.", 404
    user_events = user.events
    invited_events = user.invited_events
    events = [
        {
            'id': event.id,
            'title': event.title,
            'start': event.date.isoformat(),  
            'evType': event.event_type,
            'priority': event.priority,
            'creator': event.owner.username,  
            'budget': event.budget,
            'description': event.description,
            'zoom_link': event.zoom_link,
            'owner': True
        }
        for event in user_events 
    ] + [
        {
            'id': event.id,
            'title': f"{event.title} (Invité(e))",
            'start': event.date.isoformat(),
            'evType': event.event_type,
            'priority': event.priority,
            'creator': event.owner.username,  
            'description': event.description,
            'zoom_link': event.zoom_link,
            'owner': False
        } for event in invited_events
    ]
    users = User.query.filter(User.id != user_id).all()
    return render_template('user_dashboard.html', user=user, events=events, users=users)



# Route pour créer un nouvel événement
@user_bp.route('/create_event', methods=['GET', 'POST'])
def create_event():
    title = request.form.get('title')
    date_str = request.form.get('date')
    user_id = request.form.get('user_id')  
    description = request.form.get('description')
    zoom_link = request.form.get('zoom_link')  
    budget = request.form.get('budget') 
    cost = request.form.get('cost')
    priority = request.form.get('priority') 
    invitee_ids = request.form.getlist('invitees[]')
    event_type = request.form.get('event_type')  
    location = request.form.get('location') 

    try:
        date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M")
    except ValueError:
        flash("Format de date invalide. Veuillez entrer une date valide.", "error")
        return redirect(url_for('user.user_dashboard', user_id=user_id))

    budget = float(budget) if budget else 0
    cost = float(cost) if cost else 0

    event = Event(
        title=title,
        date=date,
        description=description,
        zoom_link=zoom_link,
        budget=budget,
        cost=cost, 
        owner_id=user_id,
        priority=priority,
        event_type=event_type, 
        location=location
    )
    db.session.add(event)
    db.session.commit()

    # Insérer des données spécifiques selon le type d'événement
    if event_type == 'marriage':
        theme = request.form.get('theme')
        dress_code = request.form.get('dress_code')
        menu_specifications = request.form.get('menu_specifications')
        programme_plan = request.form.get('programme_plan')
        autre = request.form.get('autre', '') 
        marriage = MarriageEvent(
            id=event.id,
            theme=theme,
            dress_code=dress_code,
            menu_specifications=menu_specifications,
            programme_plan=programme_plan, 
            autre=autre
        )
        db.session.add(marriage)
        db.session.commit()

    elif event_type == 'party':
        theme = request.form.get('theme')
        autre = request.form.get('autre', '') 
        party = PartyEvent(
            id=event.id,
            theme=theme,
            autre=autre
        )
        db.session.add(party)
        db.session.commit()

    elif event_type == 'meeting':
        duration = request.form.get('duration')
        meeting_type = request.form.get('meeting_type')
        plan = request.form.get('plan')
        autre = request.form.get('autre', '') 
        meeting = MeetingEvent(
            id=event.id,
            duration=duration,
            meeting_type=meeting_type,
            plan=plan, 
            autre=autre
        )
        db.session.add(meeting)
        db.session.commit()

    elif event_type == 'festival':
        theme = request.form.get('theme')
        price_per_person = request.form.get('price_per_person')
        planning = request.form.get('planning')
        autre = request.form.get('autre', '') 
        festival = FestivalEvent(
            id=event.id,
            theme=theme,
            price_per_person=price_per_person,
            planning=planning, 
            autre=autre
        )
        db.session.add(festival)
        db.session.commit()
    # Ajouter les invités
    if invitee_ids:
        for invitee_id in invitee_ids:
            # Créer une invitation
            invitation = Invitation(user_id=invitee_id, event_id=event.id)
            db.session.add(invitation)

            # Ajouter une notification pour chaque invité
            message = f"Bonjour cher utilisateur, vous êtes informé que vous avez été invité à l'événement '{title}'!"
            notification = Notification(user_id=invitee_id, message=message)
            db.session.add(notification)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        flash(f"Erreur lors de la création de l'événement: {e}", "error")
    return redirect(url_for('user.user_dashboard', user_id=current_user.id))



# Route pour rechercher les utilisateurs 
@user_bp.route('/search_users', methods=['GET'])
def search_users():
    query = request.args.get('q', '').strip().lower()
    event_owner_id = request.args.get('owner_id', type=int)

    if not query:
        return jsonify([])

    users = User.query.filter(
        (User.name.ilike(f'%{query}%')) |
        (User.family_name.ilike(f'%{query}%')) |
        (User.username.ilike(f'%{query}%')) |
        (User.email.ilike(f'%{query}%'))
    ).filter(User.id != event_owner_id).all()

    user_data = [
        {"id": user.id, "name": user.name, "family_name": user.family_name, "username": user.username, "email": user.email}
        for user in users
    ]

    return jsonify(user_data)



# Route pour modifier un événement
@user_bp.route('/edit_event/<int:event_id>', methods=['GET', 'POST'])
def edit_event(event_id):
    event = Event.query.get_or_404(event_id)
    all_users = User.query.filter(User.id != event.owner_id).all()
    invited_user_ids = {user.id for user in event.invited_users}
    is_modifier_invited = current_user.id in invited_user_ids  # Vérifiez si le modificateur est un invité
    is_owner = current_user.id == event.owner_id
    users_to_add = set()  
    users_to_remove = set()  

    if request.method == 'POST':
        # Gérer la modification des événements si l'utilisateur actuel est le propriétaire
        if is_owner:
            title = request.form.get('title')
            date_str = request.form.get('date')
            zoom_link = request.form.get('zoom_link')
            budget = request.form.get('budget')
            cost = request.form.get('cost')
            description = request.form.get('description')
            priority = request.form.get('priority')
            event_type = request.form.get('event_type')

            if 'T' not in date_str:
                date_str += 'T00:00'
            date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M")
            event.title = title
            event.date = date
            event.zoom_link = zoom_link or None
            event.budget = float(budget) if budget else None
            event.cost = float(cost) if cost else None
            event.description = description
            event.priority = priority
            event.event_type = event_type

            if event.event_type == 'marriage' and event.marriage_details:
                event.marriage_details.theme = request.form.get('theme')
                event.marriage_details.dress_code = request.form.get('dress_code')
                event.marriage_details.menu_specifications = request.form.get('menu')
                event.marriage_details.program_plan = request.form.get('programme_plan')

            elif event.event_type == 'party' and event.party_details:
                event.party_details.theme = request.form.get('theme')
                event.party_details.autre = request.form.get('autre')

            elif event.event_type == 'meeting' and event.meeting_details:
                event.meeting_details.duration = request.form.get('duration')
                event.meeting_details.meeting_type = request.form.get('meeting_type')
                event.meeting_details.plan = request.form.get('plan')

            elif event.event_type == 'festival' and event.festival_details:
                event.festival_details.theme = request.form.get('theme')
                event.festival_details.price_per_person = request.form.get('price_per_person')
                event.festival_details.planning = request.form.get('planning')

            invitees_list = request.form.getlist('invitees[]')  # Liste des utilisateurs invités
            invitees_list = [user_id.strip() for user_id in invitees_list if user_id.strip()]  # Filtrer les valeurs vides
            new_invited_user_ids = set(map(int, invitees_list)) if invitees_list else invited_user_ids

            if not invitees_list:
                new_invited_user_ids = invited_user_ids  # Conserver les invités actuels
            else:
                new_invited_user_ids = set(map(int, filter(None, invitees_list)))

            # Calculer les utilisateurs à ajouter et à supprimer
            users_to_add = new_invited_user_ids - invited_user_ids
            users_to_remove = invited_user_ids - new_invited_user_ids

            for user_id in users_to_add:
                user = User.query.get(user_id)
                if user:
                    event.invited_users.append(user)
                    notification_message = f"Bonjour {user.username}, vous avez été invité à l'événement '{event.title}'."
                    notification = Notification(user_id=user.id, message=notification_message)
                    db.session.add(notification)

            for user_id in users_to_remove:
                user = User.query.get(user_id)
                if user:
                    event.invited_users.remove(user)

            # Informer les invités actuels de la mise à jour
            notification_message = f"L'événement '{event.title}' a été modifié. Veuillez vérifier les détails."
            for user_id in new_invited_user_ids:
                notification = Notification(user_id=user_id, message=notification_message)
                db.session.add(notification)

        # Gérer l'ajout de commentaires si l'utilisateur est un invité
        elif current_user.id in invited_user_ids:
            new_comment = request.form.get('comments')
            if new_comment:
                if event.comments:
                    event.comments += f"\n{current_user.username}: {new_comment}"
                else:
                    event.comments = f"{current_user.username}: {new_comment}"

                owner_notification_message = f"L'utilisateur {current_user.username} a ajouté un commentaire sur votre événement '{event.title}': \"{new_comment}\"."
                owner_notification = Notification(user_id=event.owner_id, message=owner_notification_message)
                db.session.add(owner_notification)  

        db.session.commit()
    return render_template('edit_event.html', event=event, all_users=all_users, invited_user_ids=list(invited_user_ids), is_owner=is_owner)



# Route pour afficher une liste des évènements de l'utilisateur.
@user_bp.route('/list_events', methods=['GET', 'POST'])
@login_required 
def list_events():
    events = Event.query.filter_by(owner=current_user).all()  
    return render_template('list_events.html', events=events)



# Route pour supprimer un évènement de la BD. 
@user_bp.route('/delete_event/<int:event_id>', methods=['POST'])
@login_required
def delete_event_post(event_id):
    event = Event.query.get_or_404(event_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404

    if event.owner_id != current_user.id:
        return jsonify({'error': 'Unauthorized action'}), 403
    
    invited_users = event.invited_users

    for user in invited_users:
        notification_message = f"L'événement '{event.title}' prévu le {event.date.strftime('%Y-%m-%d %H:%M')} a été annulé."
        notification = Notification(user_id=user.id, message=notification_message, is_read=False)
        db.session.add(notification)

    try:
        db.session.delete(event)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        flash(f"Erreur lors de la suppression de l'événement : {e}", "error")

    return redirect(url_for('user.user_dashboard', user_id=current_user.id))



# Route pour afficher une liste des notifications reçues. 
@user_bp.route('/notifications', methods=['GET'])
def notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.timestamp.desc()).all()
    return render_template('notifications.html', notifications=notifications)



# Route pour supprimer une notification 
@user_bp.route('/notifications/delete/<int:notification_id>', methods=['POST'])
@login_required
def delete_notification(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    # Vérifiez que la notification appartient à l'utilisateur actuel
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Notification supprimée avec succès!'}), 200



# Route pour que l'invitee decline une invitation 
@user_bp.route('/refuse_event/<int:event_id>', methods=['POST'])
def refuse_invitation(event_id):
    user = current_user
    invitation = Invitation.query.filter_by(user_id=user.id, event_id=event_id).first()
    if not invitation:
        return jsonify({'error': 'Invitation not found'}), 404

    db.session.delete(invitation)
    event = Event.query.get(event_id)
    if event:
        notification_message = f"L'utilisateur {user.username} a refusé l'invitation à l'événement '{event.title}'."
        notification = Notification(user_id=event.owner_id, message=notification_message)
        db.session.add(notification)

    try:
        db.session.commit()
        return jsonify({'message': 'Invitation refused successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {e}'}), 500



# Route pour gérer le marquage des notifications comme « lues » pour l'utilisateur actuellement authentifié. 
@user_bp.route('/notifications/mark_as_read', methods=['POST'])
def mark_as_read():
    if current_user.is_authenticated:
        notification_ids = request.form.getlist('notification_ids')
        if notification_ids:
            notifications = Notification.query.filter(
                Notification.id.in_(notification_ids), 
                Notification.user_id == current_user.id
            ).all()

            for notification in notifications:
                notification.is_read = True

            db.session.commit()

        unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        return jsonify({'unread_count': unread_count})
    return jsonify({'unread_count': 0})



# Route pour fournir le nombre de notifications non lues pour l'utilisateur actuellement authentifié. 
@user_bp.route('/notifications/unread_count')
def unread_count():
    if current_user.is_authenticated:
        count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        return jsonify({'unread_count': count})
    return jsonify({'unread_count': 0})



# Route pour calculer le budget total des tous les evenements 
@user_bp.route('/finance')
def finance():
    owned_events = Event.query.filter(Event.owner_id==current_user.id, Event.budget.isnot(None), Event.budget > 0).all()
    invited_events = Event.query.join(Invitation).filter(Invitation.user_id == current_user.id, Event.cost.isnot(None), Event.cost > 0).all()

    total_owned_budget = sum(float(event.budget or 0) for event in owned_events)
    total_invited_budget = sum(float(event.cost or 0) for event in invited_events)
    total_budget = total_owned_budget + total_invited_budget
    
    return render_template(
        'finance.html', 
        owned_events=owned_events,
        invited_events=invited_events,
        total_owned_budget=total_owned_budget,
        total_invited_budget=total_invited_budget,
        total_budget=total_budget
    )


