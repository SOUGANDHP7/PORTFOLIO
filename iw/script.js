document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GSAP & Global Setup ---
    gsap.registerPlugin(ScrollTrigger);

    // --- 2. Audio Logic ---
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    let isPlaying = false;
    
    function toggleMusic() {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
        } else {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            musicBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }
    musicBtn.addEventListener('click', toggleMusic);

    // --- 3. Love Letter Modal ---
    const letterBtn = document.getElementById('letter-btn');
    const modal = document.getElementById('love-letter-modal');
    const closeModalBtn = document.getElementById('close-modal');

    letterBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (!isPlaying) toggleMusic();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    });
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // --- 4. Page Navigation & Transitions ---
    const pages = {
        page1: document.getElementById('page-1'),
        page2: document.getElementById('page-2'),
        page3: document.getElementById('page-3'),
        page4: document.getElementById('page-4'),
        page5: document.getElementById('page-5')
    };

    function transitionPage(from, to, animation = 'slide-up') {
        pages[from].classList.add('hidden', animation);
        pages[from].classList.remove('active');
        
        setTimeout(() => {
            pages[to].classList.remove('hidden');
            pages[to].classList.add('active');
            
            if (to === 'page2') {
                ScrollTrigger.refresh();
                gsap.fromTo(".fade-in-up", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" });
            }
            if (to === 'page5') {
                initLanterns();
            }
        }, 800);
    }

    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isPlaying) toggleMusic();
        transitionPage('page1', 'page2', 'slide-up');
    });

    document.getElementById('to-page-3-btn').addEventListener('click', () => {
        transitionPage('page2', 'page3', 'slide-up');
        initMatchGame(); // Initialize matching game cards when entering page 3
    });

    document.getElementById('to-page-4-btn').addEventListener('click', () => {
        transitionPage('page3', 'page4', 'slide-up');
    });

    document.getElementById('to-page-5-btn').addEventListener('click', () => {
        transitionPage('page4', 'page5', 'slide-up');
    });

    // --- 5. Page 2 GSAP Scroll Animations ---
    gsap.utils.toArray('.gs-reveal').forEach(function(elem) {
        gsap.fromTo(elem, 
            { y: 50, opacity: 0 }, 
            {
                y: 0, opacity: 1, duration: 1, ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    scroller: ".scrollable",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // --- 6. Global Particles Canvas ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedY = (Math.random() - 0.5) * 1;
            this.speedX = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.pulse = Math.random() * 0.02;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.opacity += this.pulse;
            if(this.opacity > 0.8 || this.opacity < 0.1) this.pulse = -this.pulse;

            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ff5e8e";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    for (let i = 0; i < 40; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    // --- 7. GAMES LOGIC (Page 3) ---

    // Game 1: Heart Catch
    const catchArea = document.getElementById('catch-area');
    const catchScoreEl = document.getElementById('catch-score');
    let catchScore = 0;
    
    setInterval(() => {
        if (!pages.page3.classList.contains('active')) return;
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.innerHTML = ['🤍','💖','💕','💘'][Math.floor(Math.random()*4)];
        heart.style.left = Math.random() * 80 + '%';
        heart.style.top = '-20px';
        catchArea.appendChild(heart);

        let top = -20;
        const fallInt = setInterval(() => {
            top += 2;
            heart.style.top = top + 'px';
            if (top > catchArea.offsetHeight) {
                clearInterval(fallInt);
                if(heart.parentNode) heart.parentNode.removeChild(heart);
            }
        }, 50);

        heart.addEventListener('click', () => {
            clearInterval(fallInt);
            if(heart.parentNode) heart.parentNode.removeChild(heart);
            catchScore++;
            catchScoreEl.innerText = catchScore;
            confetti({ particleCount: 15, spread: 30, origin: { y: 0.7, x: heart.offsetLeft/catchArea.offsetWidth }});
        });
    }, 1500);

    // Game 2: Love Quiz
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const quizQ = document.getElementById('quiz-q');
    quizBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.dataset.correct === "true") {
                e.target.classList.add('correct');
                quizQ.innerText = "You know me perfectly! 💕";
                confetti({ particleCount: 50, spread: 70 });
            } else {
                e.target.classList.add('wrong');
                quizQ.innerText = "Oops! Try again... 🥺";
            }
        });
    });

    // Game 3: Spin Wheel
    const wheel = document.getElementById('love-wheel');
    const spinBtn = document.getElementById('spin-btn');
    const wheelResult = document.getElementById('wheel-result');
    let currentRotation = 0;
    const prizes = ["A Kiss!", "A Hug!", "Movie Date!", "Dinner Date!", "Free Massage!"];

    spinBtn.addEventListener('click', () => {
        const extraSpins = Math.floor(Math.random() * 5 + 5) * 360;
        const randomAngle = Math.floor(Math.random() * 360);
        currentRotation += extraSpins + randomAngle;
        wheel.style.transform = `rotate(${currentRotation}deg)`;
        
        setTimeout(() => {
            const index = Math.floor(Math.random() * prizes.length);
            wheelResult.innerText = "You won: " + prizes[index] + " 🎉";
            confetti();
        }, 3000);
    });

    // Game 4: Love Match
    const matchArea = document.getElementById('match-area');
    const icons = ['💍','💍','💌','💌','🌹','🌹'];
    let flippedCards = [];
    let matchedCount = 0;
    
    function initMatchGame() {
        matchArea.innerHTML = '';
        flippedCards = [];
        matchedCount = 0;
        const shuffled = icons.sort(() => Math.random() - 0.5);
        
        shuffled.forEach(icon => {
            const card = document.createElement('div');
            card.classList.add('match-card');
            const iconSpan = document.createElement('span');
            iconSpan.innerText = icon;
            card.appendChild(iconSpan);
            
            card.addEventListener('click', () => {
                if (card.classList.contains('flipped') || flippedCards.length === 2) return;
                card.classList.add('flipped');
                flippedCards.push(card);
                
                if (flippedCards.length === 2) {
                    setTimeout(() => {
                        if (flippedCards[0].innerText === flippedCards[1].innerText) {
                            matchedCount += 2;
                            if (matchedCount === icons.length) {
                                setTimeout(() => confetti(), 300);
                            }
                        } else {
                            flippedCards[0].classList.remove('flipped');
                            flippedCards[1].classList.remove('flipped');
                        }
                        flippedCards = [];
                    }, 800);
                }
            });
            matchArea.appendChild(card);
        });
    }

    // Game 5: Love Meter
    const chargeBtn = document.getElementById('charge-btn');
    const meterFill = document.getElementById('meter-fill');
    const meterText = document.getElementById('meter-text');
    let charge = 0;

    chargeBtn.addEventListener('click', () => {
        charge += 10;
        if (charge > 100) charge = 100;
        meterFill.style.width = charge + '%';
        meterText.innerText = charge;
        if (charge === 100) {
            chargeBtn.innerText = "Fully Charged! 💖";
            confetti({ particleCount: 100, spread: 90 });
        }
    });
    
    // Drain meter over time
    setInterval(() => {
        if (charge > 0 && charge < 100) {
            charge -= 2;
            if (charge < 0) charge = 0;
            meterFill.style.width = charge + '%';
            meterText.innerText = charge;
        }
    }, 1000);


    // --- 8. Secret Garden Logic (Page 4) ---
    const gardenItems = document.querySelectorAll('.magical-item');
    const gardenMsg = document.getElementById('garden-message');
    
    gardenItems.forEach(item => {
        item.addEventListener('click', () => {
            gardenMsg.innerText = item.dataset.msg;
            gardenMsg.classList.remove('hidden');
            gsap.fromTo(gardenMsg, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
            
            setTimeout(() => {
                gardenMsg.classList.add('hidden');
            }, 3000);
        });
    });

    // --- 9. Lantern Ending Logic (Page 5) ---
    function initLanterns() {
        const lanternContainer = document.getElementById('lanterns');
        lanternContainer.innerHTML = '';
        
        for (let i = 0; i < 20; i++) {
            const lantern = document.createElement('div');
            lantern.classList.add('lantern');
            lantern.style.left = Math.random() * 100 + 'vw';
            lantern.style.animationDuration = Math.random() * 10 + 10 + 's';
            lantern.style.animationDelay = Math.random() * 5 + 's';
            lanternContainer.appendChild(lantern);
        }
    }
});
