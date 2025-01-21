/**
 * Fonction secondaire permettant d'afficher la date sous une 
 * belle forme lorsqu'on affiche l'event trouvé
 */
function formatter_date(une_date) {
    const date = new Date(une_date);
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    const jour_de_la_semaine = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${jour_de_la_semaine} ${day}-${month}-${year} à ${hours}:${minutes}`;
}

$(document).ready(function() {
    $('#searchEventButton').on('click', function() {
        $('#searchResultsEv').empty();
    });

    $('#searchInput').on('input', function() {
        const query = $(this).val().toLowerCase();
        const events = JSON.parse($('#events-data').text());

        $('#searchResultsEv').empty();

        if (query === '') { return; } // s'il n'y a rien dans la barre de recherche, ne rien mettre

        // Filtrer les évenements qui contiennent le mot-clé recherché dans le titre ou la description
        const filteredEvents = events.filter(event => {
            const eventTitle = event.title.toLowerCase();
            const eventDescription = event.description ? event.description.toLowerCase() : '';
            return eventTitle.includes(query) || eventDescription.includes(query);
        });

        // Afficher les résultats de recherche
        if (filteredEvents.length > 0) { 
            filteredEvents.forEach(event => {
                // Ajouter un surlignage au mot-clé trouvé
                const titre_trouve = event.title.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);
                const description_trouve = event.description
                //console.log("description", description_trouve)
                    ? event.description.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`)
                    : 'Aucune description';

                // Ajouter un aperçu de la description autour du mot-clé (autour du texte)
                const description_raccourci = description_trouve.length > 100
                    ? description_trouve.substring(0, 100) + '...'
                    : description_trouve;
                    //console.log("description", description_trouve); 
    
                $('#searchResultsEv').append(`
                    <div class="search-result-item mb-3" data-event-id="${event.id}">
                        <strong>${titre_trouve}</strong>
                        <br> Date : ${formatter_date(event.start)} <br>
                        Description : ${description_raccourci}
                    </div>
                `);
            });
        } else {
            $('#searchResultsEv').append('<p>Aucun évènement trouvé.</p>');
        }
        
        /**
         * Afficher un modal contenant les détails de l'événement trouvé 
         * au cas où le user aimerait voir les details de l'event 
         * lorsqu'il le recherche
         */
        $('.search-result-item').on('click', function() {
            const eventId = $(this).data('event-id');
            const selectedEvent = events.find(event => event.id === eventId);
            
            if (selectedEvent) {
                $('#eventTitle').text(selectedEvent.title);
                $('#eventDate').text(formatter_date(selectedEvent.start));
                
                if (typeof selectedEvent.zoom_link === 'string' && selectedEvent.zoom_link.startsWith('https')) {
                    $('#modalEventZoomLink').attr('href', selectedEvent.zoom_link)
                                            .text(selectedEvent.zoom_link)
                                            .css({ 'text-decoration': 'underline', 'color': 'blue' });
                } else {
                    $('#modalEventZoomLink').removeAttr('href')
                                            .text('Pas de lien de visio-conférence')
                                            .css({ 'text-decoration': 'none', 'color': 'black', 'font-weight': 'normal'});
                }

                $('#modalBudget').text(selectedEvent.budget || '0');
                $('#eventDescription').text(selectedEvent.description || 'Aucune description');
                $('#eventCreator').text(selectedEvent.creator || 'Inconnu');

                /**
                 * Ne pas afficher la liste des invités de l'évènement 
                 * (s'il y en a) car on essaie d'afficher seulement les détails
                 * prioritaires de l'evenement
                 */ 
                const invitedUsersList = $('#invitedUsersList');
                invitedUsersList.empty();
                invitedUsersList.append('<p>Voir spécifiquement les détails de l\'évenement pour consulter la liste des invités</p>');

                //Faire fonctionner les boutons 'Supprimer' et 'Modifier' du modal d'affichage de l'event trouvé
                $('#butEv').attr('href', `/user/edit_event/${selectedEvent.id}`); //bouton 'Modifier'

                /*const deleteButton = document.getElementById('deleteEventButton'); //bouton 'Supprimer'
                deleteButton.setAttribute('data-event-id', selectedEvent.id);*/

                /*const currentUserIsOwner = info.event.extendedProps.owner;
                    // Set the event ID for the delete button
                const deleteButton = document.getElementById('deleteEventButton');
                deleteButton.setAttribute('data-event-id', info.event.id);

                    // Set the event ID for the refuse button
                const refuseButton = document.getElementById('refuseEventButton');
                refuseButton.setAttribute('data-event-id', info.event.id);

                if (currentUserIsOwner) {
                        // Show delete button and hide refuse button
                    deleteButton.style.display = 'block';
                    refuseButton.style.display = 'none';
                    deleteButton.setAttribute('data-event-id', info.event.id);
                } else {
                        // Show refuse button and hide delete button
                    deleteButton.style.display = 'none';
                    refuseButton.style.display = 'block';
                    refuseButton.setAttribute('data-event-id', info.event.id);
                }*/

                // Appeler la fonction globale setupDeleteEventListener définie dans le fichier user_dashboard.js
                /*if (window.setupDeleteEventListener) {
                    window.setupDeleteEventListener(deleteButton);
                }*/

                // Afficher le modal des détails de l'événement trouvé
                $('#eventDetailsModal').modal('show');
            }
        });
    });
});
