// Fonction pour validation du lien zoom 
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    const zoom_link_field = form.querySelector("input[name='zoom_link']");

    zoom_link_field.addEventListener("input", function() {
        const zoom_link_regex = /^(https:\/\/[^ ]*zoom\.[^ ]*\/j\/[^ ]*)?$/;
        if (!zoom_link_regex.test(zoom_link_field.value)) {
            zoom_link_field.setCustomValidity("Veuillez mettre un bon lien zoom");
            zoom_link_field.style.borderColor = "red";
        } else {
            zoom_link_field.setCustomValidity("");
            zoom_link_field.style.borderColor = "green";
        }
    });
});