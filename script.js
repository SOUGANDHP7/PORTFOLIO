// Blob Following Mouse Effect
const blob = document.getElementById("blob");

document.body.onpointermove = event => {
    const { clientX, clientY } = event;

    // Use animate for smooth movement
    blob.animate({
        left: `${clientX}px`,
        top: `${clientY}px`
    }, { duration: 3000, fill: "forwards" });
};

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Unobserve after showing for one-time animation
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

// Navbar Hide/Show on Scroll
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (lastScrollY < window.scrollY && window.scrollY > 100) {
        navbar.classList.add('scroll-down');
    } else {
        navbar.classList.remove('scroll-down');
    }
    lastScrollY = window.scrollY;
});

// Contact Form Handling with EmailJS
const form = document.getElementById('contact-form');
const statusDiv = document.getElementById('form-status');
const fallbackContact = document.getElementById('fallback-contact');

// EmailJS Keys
const EMAILJS_PUBLIC_KEY = "soNWhsjxG9bVPDHaZ";
const EMAILJS_SERVICE_ID = "service_0tanorr";
const EMAILJS_TEMPLATE_ID = "template_mpx3acx";

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
} else {
    console.error("EmailJS SDK failed to load. Please check your internet connection or ad blocker.");
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Hide fallback initially
    fallbackContact.style.display = 'none';
    
    // Validation
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject ? form.subject.value.trim() : '';
    const message = form.message.value.trim();
    
    if (!name || !email || !subject || !message) {
        statusDiv.style.color = '#ff6b6b';
        statusDiv.textContent = 'Please fill out all required fields.';
        return;
    }
    
    if (!validateEmail(email)) {
        statusDiv.style.color = '#ff6b6b';
        statusDiv.textContent = 'Please enter a valid email address.';
        return;
    }

    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    
    // UI Loading State
    btn.textContent = 'Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.style.cursor = 'not-allowed';
    statusDiv.textContent = '';

    // Date formatting for the template
    const currentDate = new Date().toLocaleString();

    const templateParams = {
        name: name,
        email: email,
        subject: subject,
        message: message,
        current_date: currentDate
    };

    console.log("Attempting to send email via EmailJS...");
    console.log("Template Parameters:", templateParams);

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            
            // Reset UI
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            
            statusDiv.style.color = 'var(--accent)';
            statusDiv.textContent = "Your message has been sent successfully. I'll get back to you soon.";
            form.reset();
            
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 8000);
        }, function(error) {
            console.error('FAILED...', error);
            
            // Reset UI
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            
            statusDiv.style.color = '#ff6b6b';
            statusDiv.textContent = "Message failed to send. Please try again later.";
            fallbackContact.style.display = 'block'; // Show fallback
            
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 8000);
        });
});
