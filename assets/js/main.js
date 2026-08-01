// Main Portfolio Interactivity & Theme Switcher
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Dark / Light Mode Theme Toggle
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');
    const themeIcon = document.getElementById('themeIcon');

    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Desktop Icon
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
        // Update Mobile Icon
        if (themeToggleBtnMobile) {
            const mobileIcon = themeToggleBtnMobile.querySelector('i');
            if (mobileIcon) {
                mobileIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
        }
    }

    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    function toggleTheme() {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (themeToggleBtnMobile) {
        themeToggleBtnMobile.addEventListener('click', toggleTheme);
    }

    // Dynamic OS Theme Preference Listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // -------------------------------------------------------------
    // 2. Active Scrollspy for Navigation Links
    // -------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#navbarResponsive .nav-link');

    function updateActiveNav() {
        let scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // -------------------------------------------------------------
    // 3. Contact Form AJAX Submission with FormSubmit API
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('contactSubmitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!contactForm.checkValidity()) {
                contactForm.classList.add('was-validated');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...';
            }

            const formData = new FormData(contactForm);
            
            try {
                const response = await fetch('https://formsubmit.co/ajax/wasikulaminbipu@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (response.ok) {
                    if (formStatus) {
                        formStatus.className = 'alert alert-success mt-3';
                        formStatus.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i> Thank you! Your message has been sent directly to DR. Wasikul Amin Bipu.';
                        formStatus.classList.remove('d-none');
                    }
                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                } else {
                    throw new Error('Form submission failed.');
                }
            } catch (error) {
                if (formStatus) {
                    formStatus.className = 'alert alert-danger mt-3';
                    formStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-2"></i> Unable to send message right now. Please email directly to <a href="mailto:wasikulaminbipu@gmail.com" class="alert-link">wasikulaminbipu@gmail.com</a>.';
                    formStatus.classList.remove('d-none');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Send Message';
                }
            }
        });
    }
});
