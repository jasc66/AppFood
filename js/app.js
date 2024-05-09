document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('.navegacion__link');
    
    links.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    function smoothScroll(event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return; // Asegúrate de que el elemento exista

        const offsetTop = targetSection.offsetTop;

        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
});
