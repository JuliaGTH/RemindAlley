document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchUsersEdit');
    const searchResults = document.getElementById('searchResultsEdit');
    const invitedUsersInput = document.getElementById('invitedUsersInputEdit'); 
    const invitedUsersList = document.getElementById('invitedUsersList');
    
    let existingInvitees = [];
    try {
        existingInvitees = JSON.parse('{{ invited_user_ids | tojson | safe }}') || [];
    } catch (e) {
        console.error("Invalid JSON for invited_user_ids:", e);
    }

    if (invitedUsersList && invitedUsersInput) {
        invitedUsersInput.value = existingInvitees.join(',');

        // Afficher les invités existants
        existingInvitees.forEach(userId => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `Utilisateur ID: ${userId}`; 
            invitedUsersList.appendChild(listItem);
        });
    }

    const invitedUsers = new Set(existingInvitees);
    const ownerIdElement = document.getElementById('ownerId');
    const ownerId = ownerIdElement ? ownerIdElement.value : null;

    if (searchInput && searchResults && ownerId) {
        searchInput.addEventListener('input', function () {
            const query = searchInput.value.trim();
            if (query.length < 2) {
                searchResults.innerHTML = ''; 
                return;
            }

            fetch(`/user/search_users?q=${encodeURIComponent(query)}&owner_id=${ownerId}`)
                .then(response => response.json())
                .then(users => {
                    searchResults.innerHTML = ''; // Effacer les résultats précédents
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
                                updateInvitedUsersListEd(user);
                                listItem.remove();
                            });
                            listItem.appendChild(inviteButton);
                            searchResults.appendChild(listItem);
                        }
                    });
                });
        });
    }

    function updateInvitedUsersListEd(user) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = `${user.name} ${user.family_name} (${user.username}) - ${user.email}`;

        const existingInput = document.querySelector(`input[value="${user.id}"]`);
        if (!existingInput) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'invitees[]';
            input.value = user.id;
            invitedUsersInput.appendChild(input);
        }

        // Add a "Remove" button for invited users
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-danger btn-sm';
        removeButton.textContent = 'Retirer';
        removeButton.addEventListener('click', function () {
            invitedUsers.delete(user.id); 
            listItem.remove();
            updateInvitedUsersInputEd(); 
        });

        listItem.appendChild(removeButton);
        invitedUsersList.appendChild(listItem);

        updateInvitedUsersInputEd();
    }

    function updateInvitedUsersInputEd() {
        // Mettre à jour le champ de saisie masqué avec les identifiants des utilisateurs invités
        const invitedUsersInput = document.getElementById('invitedUsersInputEdit');
        if (invitedUsersInput) {
            invitedUsersInput.value = Array.from(invitedUsers).join(','); // Convertir en chaîne de caractères séparés par des virgules
        }
    }

});

document.getElementById('modifEv').addEventListener('submit', function (event) {
    event.preventDefault(); 
    const form = event.target;
    const invitedUsersInput = document.getElementById('invitedUsersInputEdit');
    const invitedUsers = Array.from(document.querySelectorAll('#invitedUsersList li')).map(li => li.dataset.userId);
    invitedUsersInput.value = invitedUsers.join(',');

    // soumettre la form via Fetch API
    fetch(form.action, {
        method: form.method,
        body: new FormData(form)
    })
        .then(response => {
            if (response.ok) {
                window.location.reload(); 
            } else {
                console.error('Form submission failed');
            }
        })
        .catch(error => console.error('Error:', error));
});