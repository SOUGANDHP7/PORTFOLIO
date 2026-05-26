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

// Contact Form Handling
const form = document.getElementById('contact-form');
const statusDiv = document.getElementById('form-status');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';

    const formData = new FormData(form);

    // Using FormSubmit API to actually send the email without needing a backend
    fetch('https://formsubmit.co/ajax/isreeharim@gmail.com', {
        method: "POST",
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        btn.textContent = originalText;
        if (data.success) {
            statusDiv.style.color = 'var(--accent)';
            statusDiv.textContent = 'Awesome! Your message has been sent successfully.';
            form.reset();
        } else {
            statusDiv.style.color = '#ff6b6b';
            statusDiv.textContent = 'Oops! Something went wrong.';
        }
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 5000);
    })
    .catch(error => {
        btn.textContent = originalText;
        statusDiv.style.color = '#ff6b6b';
        statusDiv.textContent = 'Oops! There was a network error.';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 5000);
    });
});
