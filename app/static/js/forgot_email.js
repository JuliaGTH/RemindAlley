// Fonction permettant de recuperer le email en cas d'oubli 
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche l'envoi du formulaire par défaut

        const usernameInput = document.querySelector('input[name="username"]');
        const username = usernameInput.value;

        if (username) {
            fetch('/auth/forgot_email', {
                method: 'POST', //GET 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => {
                if (!response.ok) {  // Check si la réponse n'est pas OK
                    throw new Error('Email non trouvé');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(`Votre courriel est : ${data.username}`);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Le courriel inexistant. Veuillez réessayer.');
            });
        } else {
            alert('Veuillez entrer une adresse email.');
        }
    });
});
