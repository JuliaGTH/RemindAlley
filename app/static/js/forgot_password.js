// app/static/js/forgot_password.js
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche l'envoi du formulaire par défaut

        const emailInput = document.querySelector('input[name="email"]');
        const email = emailInput.value;

        if (email) {
            fetch('/auth/forgot_password', {
                method: 'POST', //GET 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => {
                if (!response.ok) {  // Check if the response is not OK
                    throw new Error('Email non trouvé');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(`Votre mot de passe est : ${data.password}`);
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
