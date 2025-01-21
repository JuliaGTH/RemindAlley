// Fonction de validation pour le Sign In 
document.addEventListener("DOMContentLoaded", function() {  
    const form = document.querySelector("form");  
    const passwordField = form.querySelector("input[name='password']");   
    const confirmPasswordField = form.querySelector("input[name='confirmPwd']");  
    const emailField = form.querySelector("input[name='email']");
    const telephoneField = form.querySelector("input[name='phone_number']");

    function validateField(field, regex, message) {
        if (!regex.test(field.value)) {
            field.setCustomValidity(message);
            field.style.borderColor = "red";
        } else {
            field.setCustomValidity("");
            field.style.borderColor = "green";
        }
    }

    // Validation num. tel. 
    telephoneField.addEventListener("input", function() {
        validateField(
            telephoneField,
            /^\d{3}-\d{3}-\d{4}$/,
            "Veuillez entrer un numéro de téléphone valide"
        );
    });

    // Validation email 
    emailField.addEventListener("input", function() {     
        validateField(
            emailField,
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Veuillez entrer une adresse courriel valide"
        );
    });

    // Validation du mot de passe (sans espaces et pas plus que 20 caracteres)
    passwordField.addEventListener("input", function() {
        const password = passwordField.value;

        // Vérifier les espaces
        if (!/^\S+$/.test(password)) {
            passwordField.setCustomValidity("Aucun espace autorisé");
            passwordField.style.borderColor = "red";
        } 
        // Vérifier la longueur
        else if (password.length > 20) {
            passwordField.setCustomValidity("Le mot de passe ne doit pas dépasser 20 caractères");
            passwordField.style.borderColor = "red";
        } 
        // Si tout est valide
        else {
            passwordField.setCustomValidity(""); 
            passwordField.style.borderColor = "green";
        }
        passwordField.reportValidity();
    });

    // Confirmation de la validation du mot de passe
    confirmPasswordField.addEventListener("input", function() {  
        if (confirmPasswordField.value !== passwordField.value) {  
            confirmPasswordField.setCustomValidity("Les mots de passe ne correspondent pas");  
            confirmPasswordField.style.borderColor = "red";  
        } else {
            confirmPasswordField.setCustomValidity("");  
            confirmPasswordField.style.borderColor = "green";   
        }
    });
});
