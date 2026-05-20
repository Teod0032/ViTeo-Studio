document.addEventListener("DOMContentLoaded", () => {
    
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    const bodyElement = document.body;
    
    // Globale variabler til lærredsfarver, så de opdateres dynamisk
    let canvasAccentRGB = "";
    // canvasDripColor fjernet, da den ikke længere bruges

    function updateCanvasColors() {
        // Lille forsinkelse for at lade CSS klassen slå helt igennem
        setTimeout(() => {
            canvasAccentRGB = getComputedStyle(bodyElement).getPropertyValue('--accent-color-rgb').trim();
        }, 50);
    }

    if (currentTheme === "dark") {
        bodyElement.setAttribute("data-theme", "dark");
    }
    updateCanvasColors(); // Hent initialfarver

    themeToggle.addEventListener("click", () => {
        let theme = bodyElement.getAttribute("data-theme");
        if (theme === "dark") {
            bodyElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            bodyElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        updateCanvasColors(); // Opdater farver når tema skifter
    });

    // Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-in").forEach(element => {
        observer.observe(element);
    });

    // Om Mig Magnetisk Knap
    const aboutCta = document.getElementById("om-mig-cta");
    const follower = document.querySelector(".cursor-follower");

    if (aboutCta && follower) {
        aboutCta.addEventListener("mousemove", (e) => {
            const rect = aboutCta.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const originX = rect.width * 0.5;
            const originY = rect.height * 0.75;
            const offsetX = mouseX - originX;
            const offsetY = mouseY - originY;
            follower.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        });

        aboutCta.addEventListener("mouseleave", () => {
            follower.style.transform = "translate(-50%, -50%)";
        });
    }

    // --- CANVAS SYSTEMS ---

    function setupCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        return { canvas, ctx, getWidth: () => width, getHeight: () => height };
    }

    const isMobile = window.innerWidth <= 900;

    // 1. Stardust Mus-spor (trail-canvas)
    if (!isMobile) {
        const { ctx: trailCtx, getWidth: getTrailWidth, getHeight: getTrailHeight } = setupCanvas('trail-canvas');
        let trailParticles = [];

        window.addEventListener('mousemove', (e) => {
            for(let i = 0; i < 2; i++) {
                trailParticles.push(new TrailParticle(e.clientX, e.clientY));
            }
        });

        class TrailParticle {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.size = Math.random() * 1.5 + 0.5; 
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.life = 1; this.decay = Math.random() * 0.05 + 0.03;
            }
            update() { this.x += this.speedX; this.y += this.speedY; this.life -= this.decay; }
            draw() {
                trailCtx.globalAlpha = Math.max(0, this.life);
                trailCtx.fillStyle = `rgba(${canvasAccentRGB}, 0.5)`; // Bruger dynamisk farve
                trailCtx.beginPath();
                trailCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                trailCtx.fill();
            }
        }

        function animateTrail() {
            trailCtx.clearRect(0, 0, getTrailWidth(), getTrailHeight());
            trailParticles = trailParticles.filter(p => p.life > 0);
            trailParticles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateTrail);
        }
        animateTrail();
    }

    // 2. Liquid Drops & Words (background-canvas) Logikken er fjernet

    // Håndtering af mobil pop-up
    const mobilePopup = document.getElementById('mobile-popup');
    const closePopupBtn = document.getElementById('close-popup');

    if (mobilePopup && closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            mobilePopup.style.display = 'none';
        });
    }
    // --- IMAGE MODAL (Lightbox) ---
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    const modalImg = document.createElement('img');
    modalImg.id = 'modal-img';
    modal.appendChild(modalImg);
    document.body.appendChild(modal);

    // Find alle elementer der fungerer som billeder
    const imageSelectors = [
        '.hero-image', 
        '.project-image', 
        '.project-hero-banner', 
        '.split-image', 
        '.branding-banner', 
        '.final-mockup',
        '.feature-card > div'
    ];

    const clickableImages = document.querySelectorAll(imageSelectors.join(', '));

    clickableImages.forEach(img => {
        // Tjek om elementet faktisk har et baggrundsbillede
        if (img.style.backgroundImage && img.style.backgroundImage !== 'none') {
            img.style.cursor = 'zoom-in';
            
            img.addEventListener('click', () => {
                // Træk URL'en ud af "url('billede.jpg')"
                const bgImage = img.style.backgroundImage;
                const url = bgImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                
                modalImg.src = url;
                modal.classList.add('show');
            });
        }
    });

    // Luk modal ved klik overalt
    modal.addEventListener('click', () => {
        modal.classList.remove('show');
        // Rens src efter en lille forsinkelse for at undgå at se skiftet
        setTimeout(() => { modalImg.src = ''; }, 300);
    });
});