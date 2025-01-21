
var clickedDate; 
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var eventsData = document.getElementById('events-data')?.textContent;
    var events = eventsData ? JSON.parse(eventsData) : []; 

    // Initialiser la fonctionnalité de recherche d'utilisateurs
    const searchInput = document.getElementById('searchUsers');
    const searchResults = document.getElementById('searchResults');
    const invitedUsersInput = document.getElementById('invitedUsersInput');
    const invitedUsers = new Set(); 

    const ownerId = document.getElementById('ownerId')?.value;

    const toggleButton = document.getElementById('toggleViewButtons'); 
    const viewButtons = document.getElementById('viewButtons');

    const colorPicker = document.getElementById('background-color');
    const savedColor = localStorage.getItem(`backgroundColor_${userId}`); // Utiliser un user-specific key

    if (savedColor) {
        document.body.style.backgroundColor = savedColor;
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.style.backgroundColor = savedColor;
        }
        if (colorPicker) {
            colorPicker.value = savedColor;
        }
    }

    if (colorPicker) {
        colorPicker.addEventListener('input', function () {
            const selectedColor = colorPicker.value;
            document.body.style.backgroundColor = selectedColor;

            const container = document.querySelector('.container-fluid');
            if (container) {
                container.style.backgroundColor = selectedColor;
            }
            // Enregistrez la couleur avec la clé spécifique à l'utilisateur
            localStorage.setItem(`backgroundColor_${userId}`, selectedColor);
        });
    } else {
        console.warn('Color picker element not found');
    } 

    if (!ownerId) {
        console.error("Owner ID not found.");
        return;
    }

    if (!calendarEl) {
        console.error("Element with ID 'calendar' not found.");
        return;
    }
    
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        views: {
            dayGridMonth: { // Vue mensuelle (déjà configurée)
                titleFormat: { year: 'numeric', month: 'short' }, // Format du titre
                buttonText: 'Mois',
            },
            timeGridWeek: { // Vue hebdomadaire
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                allDaySlot: false, // Supprime la colonne "all-day"
                buttonText: 'Semaine',
            },
            timeGridDay: { // Vue journalière
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                buttonText: 'Jour',
                allDaySlot: false // Supprime la colonne "all-day"
            },
            dayGridYear: { // Vue annuelle (maybe à enlever she's lowkey ugly...)
                type: 'dayGrid',
                duration: { years: 1 }, // Affiche 1 an
                buttonText: 'Année', // Texte du bouton
                dayHeaderFormat: { weekday: 'short' }, // Format des jours (lun, mar, ...)
                titleFormat: { year: 'numeric' } // Format du titre (2024)
            }
        },
        events: events, 

        // Date click function pour afficher le modal de création d'événement 
        dateClick: function (info) {
            const eventModal = $('#eventModal');
        
            if (!eventModal.length) {
                console.error("Modal with ID 'eventModal' not found in the DOM.");
                return;
            }
        
            eventModal.modal('show');
        
            // Définir la date cliquée dans le champ dateTime
            eventModal.on('shown.bs.modal', function () {
                const dateTimeField = document.getElementById('dateTime');
                if (dateTimeField) {
                    dateTimeField.value = info.dateStr + 'T00:00'; 
                } else {
                    console.warn("Element with ID 'dateTime' not found in the dynamic fields.");
                }
        
                const eventTypeField = document.getElementById('eventType');
                if (eventTypeField) {
                    eventTypeField.value = ''; 
                    eventTypeField.dispatchEvent(new Event('change')); 
                } else {
                    console.error("Element with ID 'eventType' not found in the DOM.");
                }
            });

            if (searchInput && searchResults) {
                searchInput.removeEventListener('input', handleSearchInput);
                searchInput.addEventListener('input', handleSearchInput);
    
                function handleSearchInput() {
                    const query = searchInput.value.trim();
                    if (query.length < 2) {
                        searchResults.innerHTML = ''; // Effacer les résultats si la requête est trop courte
                        return;
                    }
    
                    fetch(`/user/search_users?q=${encodeURIComponent(query)}&owner_id=${ownerId}`) 
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Failed to fetch search results.");
                            }
                            return response.json();
                        })
                        .then(users => {
                            searchResults.innerHTML = ''; 
    
                            if (users.length === 0) {
                                searchResults.innerHTML = '<li class="list-group-item">Aucun utilisateur trouvé</li>';
                                return;
                            }
    
                            // Remplir les résultats de recherche
                            users.forEach(user => {
                                if (!invitedUsers.has(user.id)) {
                                    const listItem = document.createElement('li');
                                    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                                    listItem.textContent = `${user.name} ${user.family_name} (${user.username}) - ${user.email}`;
                                    const inviteButton = document.createElement('button');
                                    inviteButton.className = 'btn btn-primary btn-sm';
                                    inviteButton.textContent = 'Inviter';
                                    inviteButton.addEventListener('click', function () {
                                        invitedUsers.add(user.id);
                                        updateInvitedUsersInput();
                                        listItem.remove(); 
                                        addUserToInvitedList(user); 
                                    });
                                    listItem.appendChild(inviteButton);
                                    searchResults.appendChild(listItem);
                                }
                            });
                        })
                        .catch(error => console.error("Error fetching search results:", error));
                }
    
                function updateInvitedUsersInput() {
                    if (invitedUsersInput) {
                        invitedUsersInput.value = Array.from(invitedUsers).join(','); 
                    }
                }
    
                function addUserToInvitedList(user) {
                    const invitedList = document.getElementById('invitedUsers');
                    if (invitedList) {
                        const invitedItem = document.createElement('li');
                        invitedItem.className = 'list-group-item';
                        invitedItem.textContent = `${user.name} ${user.family_name} (${user.username}) - ${user.email}`;
                        invitedList.appendChild(invitedItem);
                    }
                }
    
                document.getElementById('eventForm').addEventListener('submit', function () {
                    updateInvitedUsersInput();
                });
            } else {
                console.error("Search input or results container not found.");
            }
    
            function updateInvitedUsersInput() {
                const invitedUsersInput = document.getElementById('invitedUsersInput');
                if (invitedUsersInput) {
                    invitedUsersInput.value = Array.from(invitedUsers).join(','); 
                }
            }

            function addUserToInvitedList(user) {
                const invitedList = document.getElementById('invitedUsers');
                if (invitedList) {
                    const invitedItem = document.createElement('li');
                    invitedItem.className = 'list-group-item';
                    invitedItem.textContent = `${user.name} ${user.family_name} (${user.username}) - ${user.email}`;
                    invitedList.appendChild(invitedItem);
                }
            }
    
            document.getElementById('eventModal').addEventListener('submit', function () {
                updateInvitedUsersInput();
            });
        },
        
        // Ajouter un événement au clic sur un événement
        eventClick: function(info) {
            document.getElementById('eventTitle').textContent = info.event.title || 'N/A';
            document.getElementById('eventDate').textContent = info.event.start.toLocaleString() || 'N/A';
            document.getElementById('evType').textContent = info.event.extendedProps.evType || 'N/A';
            document.getElementById('eventPriority').textContent = info.event.extendedProps.priority || 'N/A';
            document.getElementById('eventCreator').innerText = info.event.extendedProps.creator || 'Inconnu';

            // Afficher le budget de manière conditionnelle si l'utilisateur est le propriétaire
            const budgetField = document.getElementById('eventBudget');
            if (info.event.extendedProps.owner) {
                budgetField.textContent = `$${info.event.extendedProps.budget || '0.00'}`;
                budgetField.closest('.budget-container').style.display = 'block'; // Afficher le champ du budget
            } else {
                budgetField.closest('.budget-container').style.display = 'none'; // Masquer le champ budgétaire
            }

            const eventType = info.event.extendedProps.evType;
            if (eventType === 'marriage') {
                eventSpecificDetails.innerHTML = `
                    <h6>Détails du mariage</h6>
                    <p><strong>Thème:</strong> ${info.event.extendedProps.theme || 'N/A'}</p>
                    <p><strong>Code vestimentaire:</strong> ${info.event.extendedProps.dress_code || 'N/A'}</p>
                `;
            } else if (eventType === 'party') {
                eventSpecificDetails.innerHTML = `
                    <h6>Détails de la fête</h6>
                    <p><strong>Thème:</strong> ${info.event.extendedProps.theme || 'N/A'}</p>
                `;
            } else if (eventType === 'meeting') {
                eventSpecificDetails.innerHTML = `
                    <h6>Détails de la réunion</h6>
                    <p><strong>Durée:</strong> ${info.event.extendedProps.duration || 'N/A'} minutes</p>
                `;
            } else if (eventType === 'festival') {
                eventSpecificDetails.innerHTML = `
                    <h6>Détails du festival</h6>
                    <p><strong>Prix par personne:</strong> ${info.event.extendedProps.price_per_person || 'N/A'}</p>
                `;
            }
            
            var editEventLink = document.querySelector('#eventDetailsModal .btn-primary');
            editEventLink.href = `/user/edit_event/${info.event.id}`;
            
            const currentUserIsOwner = info.event.extendedProps.owner;

            const deleteButton = document.getElementById('deleteEventButton');
            deleteButton.setAttribute('data-event-id', info.event.id);
            const refuseButton = document.getElementById('refuseEventButton');
            refuseButton.setAttribute('data-event-id', info.event.id);

            if (currentUserIsOwner) {
                // Afficher le bouton Supprimer et masquer le bouton Refuser
                deleteButton.style.display = 'block';
                refuseButton.style.display = 'none';
                deleteButton.setAttribute('data-event-id', info.event.id);
            } else {
                // Afficher le bouton Refuser et masquer le bouton Supprimer
                deleteButton.style.display = 'none';
                refuseButton.style.display = 'block';
                refuseButton.setAttribute('data-event-id', info.event.id);
            }

            // Afficher la modal
            $('#eventDetailsModal').modal('show');
        }          
    });
    
    calendar.render();
    
    //Affichage des differentes vues du calendrier
    toggleButton.addEventListener('click', function () {
        if (viewButtons.style.display === 'none') {
            viewButtons.style.display = 'block';
        } else {
            viewButtons.style.display = 'none';
        }
    });
    // Ajouter un event listener pour chaque bouton de vue
    document.querySelectorAll('.fc-button').forEach(function (button) {
        button.addEventListener('click', function () {
            const viewName = button.getAttribute('data-view'); // Récupère la vue à partir de l'attribut data-view
            if (viewName) {
                calendar.changeView(viewName); // Change la vue du calendrier
                viewButtons.style.display = 'none'; // Masquer les boutons après le clic
            }
            
        });
    });

    // Ajouter event listener pour le delete button
    const deleteButton = document.getElementById('deleteEventButton');
    deleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        const eventId = deleteButton.getAttribute('data-event-id');

        if (!eventId) {
            console.error("Aucun ID d'événement trouvé pour la suppression.");
            alert('Vous devez aller sur l\'évènement lui-même dans le calendrier pour pouvoir le supprimer');
            return;
        }

        // Confirmer avant de supprimer
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            return;
        }

        // Envoyer une requête POST pour supprimer l'événement
        fetch(`/user/delete_event/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Événement supprimé avec succès!');
                updateUnreadCount(); 
                location.reload(); 
            } else {
                alert('Une erreur est survenue lors de la suppression de l\'événement.');
            }
        })
        .catch(error => console.error('Erreur:', error));
    });

    // Event listener pour le bouton de refus
    const refuseButton = document.getElementById('refuseEventButton');
    refuseButton.addEventListener('click', function (event) {
        event.preventDefault();
        const eventId = refuseButton.getAttribute('data-event-id');

        if (!eventId) {
            console.error("Aucun ID d'événement trouvé pour refuser.");
            alert('Vous devez aller sur l\'évènement lui-même dans le calendrier pour pouvoir le refuser');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir refuser cette invitation ?')) {
            return;
        }

        // Envoyer une demande de refus d'invitation à l'événement
        fetch(`/user/refuse_event/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    alert('Invitation refusée avec succès!');
                    location.reload(); 
                } else {
                    alert('Une erreur est survenue lors du refus de l\'invitation.');
                }
            })
            .catch(error => console.error('Erreur:', error));
    });

    function updateUnreadCount() {
        fetch('/user/notifications/unread_count')
            .then(response => response.json())
            .then(data => {
                const badge = document.querySelector('.nav-link .badge');
                if (data.unread_count > 0) {
                    badge.classList.remove('badge-secondary');
                    badge.classList.add('badge-danger');
                    badge.textContent = data.unread_count;
                } else {
                    badge.classList.remove('badge-danger');
                    badge.classList.add('badge-secondary');
                    badge.textContent = '0';
                }
            })
            .catch(error => console.error('Erreur lors de la mise à jour du compteur:', error));
    }
    setInterval(updateUnreadCount, 10000);
    updateUnreadCount();                  
}); 
