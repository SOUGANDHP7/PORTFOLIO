document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GSAP & Global Setup ---
    gsap.registerPlugin(ScrollTrigger);

    // --- 1b. Video Setup ---
    const animeVideo = document.getElementById('anime-video');
    const videoLoader = document.getElementById('video-loader');

    function hideVideoLoader() {
        if (videoLoader) videoLoader.classList.add('loaded');
    }

    if (animeVideo) {
        // Hide loader once video can play
        animeVideo.addEventListener('canplay', hideVideoLoader);
        animeVideo.addEventListener('loadeddata', hideVideoLoader);
        // Attempt autoplay when video is ready
        animeVideo.addEventListener('canplaythrough', () => {
            hideVideoLoader();
            animeVideo.play().catch(() => {
                // Autoplay blocked — video will play on user interaction
            });
        });
        // Handle video error
        animeVideo.addEventListener('error', () => {
            hideVideoLoader();
            console.warn('Video failed to load. Check file path and format.');
        });
        // Force load
        animeVideo.load();
    }

    // --- 1c. Image Lazy-load Fade-in ---
    // Images with loading="lazy" will already have onload handlers in HTML
    // Also handle already-cached images
    document.querySelectorAll('.img-container img').forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add('loaded');
        }
    });

    // --- 2. Audio Logic ---
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    let isPlaying = false;
    
    function toggleMusic() {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            musicBtn.textContent = '🎵';
        } else {
            bgMusic.play().catch(e => {
                console.log("Audio play failed (no music file):", e);
                musicBtn.textContent = '🎵';
            });
            musicBtn.classList.add('playing');
            musicBtn.textContent = '🎶';
        }
        isPlaying = !isPlaying;
    }
    musicBtn.addEventListener('click', toggleMusic);
    bgMusic.addEventListener('error', () => {
        // Music file missing — silently disable music button
        musicBtn.style.opacity = '0.5';
        musicBtn.title = 'Music file not found';
    });

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
        const fromPage = pages[from];
        const toPage = pages[to];

        // Pause video if leaving page2
        if (from === 'page2' && animeVideo) animeVideo.pause();

        fromPage.classList.add('hidden', animation);
        fromPage.classList.remove('active');

        // Reduced delay to match the faster 0.7s CSS transition
        setTimeout(() => {
            toPage.classList.remove('hidden');
            toPage.classList.add('active');

            // Resume video when entering page2
            if (to === 'page2' && animeVideo) {
                animeVideo.play().catch(() => {});
            }
            if (to === 'page2') {
                ScrollTrigger.refresh();
                gsap.fromTo(".fade-in-up", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" });
            }
            if (to === 'page5') {
                initLanterns();
            }
        }, 400);
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
            { y: 40, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
                scrollTrigger: {
                    trigger: elem,
                    scroller: "#page-2",
                    start: "top 88%",
                    toggleActions: "play none none none" // no reverse = less re-calculation
                }
            }
        );
    });

    // --- 6. Global Particles Canvas ---
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId = null;

    // Detect mobile for reduced particle count
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 15 : 30;

    let resizeTimer;
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 200); // debounced
    });
    resizeCanvas();

    class Particle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.15;
            this.pulse = Math.random() * 0.008 + 0.003;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.opacity += this.pulse;
            if (this.opacity > 0.65 || this.opacity < 0.1) this.pulse = -this.pulse;
            if (this.y < -10) this.reset();
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
        }
        draw() {
            // No shadowBlur — it's extremely expensive on canvas
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        particles.forEach(p => { p.update(); p.draw(); });
        ctx.globalAlpha = 1;
        animFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Pause particle loop when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animFrameId);
        } else {
            animateParticles();
        }
    });


    // --- 7. GAMES LOGIC (Page 3) ---

    // Game 1: Heart Catch — rAF-based, uses transform (GPU) not top (layout)
    const catchArea = document.getElementById('catch-area');
    const catchScoreEl = document.getElementById('catch-score');
    let catchScore = 0;
    const HEARTS = ['\uD83E\uDD0D','\uD83D\uDC96','\uD83D\uDC95','\uD83D\uDC98'];

    function spawnHeart() {
        if (!pages.page3.classList.contains('active')) return;
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
        heart.style.left = (Math.random() * 82) + '%';
        const areaH = catchArea.offsetHeight;
        let y = -30;
        heart.style.transform = `translateY(${y}px) translateZ(0)`;
        catchArea.appendChild(heart);

        const speed = isMobile ? 1.5 : 2.2;
        let alive = true;

        function fall() {
            if (!alive) return;
            y += speed;
            heart.style.transform = `translateY(${y}px) translateZ(0)`;
            if (y > areaH + 10) {
                alive = false;
                heart.remove();
                return;
            }
            requestAnimationFrame(fall);
        }
        requestAnimationFrame(fall);

        heart.addEventListener('click', () => {
            alive = false;
            heart.remove();
            catchScore++;
            catchScoreEl.textContent = catchScore;
            confetti({ particleCount: 12, spread: 28, origin: { y: 0.7 }});
        }, { once: true });

        // Touch support
        heart.addEventListener('touchstart', (e) => {
            e.preventDefault();
            alive = false;
            heart.remove();
            catchScore++;
            catchScoreEl.textContent = catchScore;
        }, { once: true, passive: false });
    }

    // Spawn interval: 1800ms desktop, 2200ms mobile
    setInterval(spawnHeart, isMobile ? 2200 : 1800);

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
        // Fewer lanterns on mobile to save GPU
        const count = isMobile ? 8 : 14;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const lantern = document.createElement('div');
            lantern.classList.add('lantern');
            lantern.style.left = Math.random() * 95 + 'vw';
            lantern.style.animationDuration = (Math.random() * 8 + 10) + 's';
            lantern.style.animationDelay = (Math.random() * 4) + 's';
            frag.appendChild(lantern);
        }
        lanternContainer.appendChild(frag);
    }

    // --- 10. Restart Journey Logic ---
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            // Fade out body for smooth transition, then reload
            document.body.style.transition = "opacity 1s ease";
            document.body.style.opacity = "0";
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }
});
