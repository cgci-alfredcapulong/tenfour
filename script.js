document.addEventListener("DOMContentLoaded", () => {
    
    /* --- 1. Local Video Lightbox Controls --- */
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const lightbox = document.getElementById("videoLightbox");
    const lightboxPlayer = document.getElementById("lightboxPlayer");
    const closeBtn = document.querySelector(".close-lightbox");

    if (portfolioItems.length > 0 && lightbox && lightboxPlayer && closeBtn) {
        portfolioItems.forEach(item => {
            item.addEventListener('click', () => {
                const videoPath = item.getAttribute('data-video-path');
                
                if (videoPath) {
                    // Instantly cap the audio level pipeline to 10% volume
                    lightboxPlayer.volume = 0.1;
                    
                    // Swap the source and prompt the player pipeline to load the file
                    lightboxPlayer.src = videoPath;
                    lightboxPlayer.load();
                    lightboxPlayer.play().catch(e => console.log("Autoplay prevented:", e));
                    
                    // Active lightbox transitions
                    lightbox.classList.add('active');
                    document.body.style.overflow = "hidden";
                    document.body.classList.remove('hovering-portfolio');
                }
            });
        });

        const closeVideo = () => {
            lightbox.classList.remove("active");
            document.body.style.overflow = "auto";
            
            if (lightboxPlayer) {
                lightboxPlayer.pause();  // Kill audio and video instantly
                lightboxPlayer.src = ""; // Clear memory buffers
            }
        };

        closeBtn.addEventListener("click", closeVideo);

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeVideo();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) closeVideo();
        });
    }

/* --- 2. HARDWARE-LOCKED CUSTOM CURSOR TRACKING --- */
const initCustomCursor = () => {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    // Use absolute page coordinate calculation to handle scrolling and canvas bounding safely
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Exact hardware point alignment. 
        // IMPORTANT: We subtract half the cursor's width/height via translation so it centers exactly on the tip of your pointer.
        cursor.style.transform = `translate3d(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%), 0)`;
    });

    // Tight, high-performance visual interpolation loop for the text marquee follower box
    const renderFollower = () => {
        // Changed interpolation step from 0.15 to 0.25 to make the text frame snappy and prevent trailing lag
        followerX += (mouseX - followerX) * 0.25;
        followerY += (mouseY - followerY) * 0.25;
        
        follower.style.transform = `translate3d(calc(${followerX}px - 50%), calc(${followerY}px - 50%), 0)`;
        requestAnimationFrame(renderFollower);
    };
    renderFollower();

    // Hover interactive scaling triggers
    const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .brutalist-slider');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            if(el.classList.contains('portfolio-item')) {
                follower.classList.add('follower-active');
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            follower.classList.remove('follower-active');
        });
    });
};

    /* --- 3. Mouse Spotlight Tracker for Hero Background --- */
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            heroSection.style.setProperty('--mouse-x', `${x}%`);
            heroSection.style.setProperty('--mouse-y', `${y}%`);
        });
    }

    /* --- 4. Real-time Film Slate Timecode Generator --- */
    const timecodeEl = document.getElementById('liveTimecode');
    if (timecodeEl) {
        setInterval(() => {
            const now = new Date();
            const hrs = String(now.getHours()).padStart(2, '0');
            const mins = String(now.getMinutes()).padStart(2, '0');
            const secs = String(now.getSeconds()).padStart(2, '0');
            const frames = String(Math.floor(Math.random() * 24)).padStart(2, '0');
            timecodeEl.textContent = `${hrs}:${mins}:${secs}:${frames}`;
        }, 41.6);
    }
});

/* --- 5. Scroll Viewport Reveals (Consolidated) --- */
const observerOptions = {
    root: null,
    threshold: 0.1,
};

const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Target all elements that need scroll reveal (combined into one call)
const revealElements = document.querySelectorAll('.portfolio-item, .manifesto, .about-split, .alt-stack');
revealElements.forEach(el => {
    el.classList.add('scroll-reveal');
    revealOnScroll.observe(el);
});

/* --- 6. Hero Void Canvas Interaction System --- */
const initHeroVoidCanvas = () => {
    const canvas = document.getElementById('voidCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 }; // Increased radius for bigger hero arena

    // The keyword matrix generated in the background loop
    const words = ["TENFOUR", "BUILT", "NOT", "BRAGGED", "104", "RAW", "SIGNAL", "23.976", "CREATIVE"];

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    };

    class Particle {
        constructor(x, y, text) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.text = text;
            this.density = (Math.random() * 25) + 15;
            this.fontSize = Math.floor(Math.random() * 16) + 11;
            this.opacity = Math.random() * 0.35 + 0.15;
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.font = `900 ${this.fontSize}px 'Helvetica Neue', Arial, sans-serif`;
            ctx.fillText(this.text, this.x, this.y);
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;
                
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dxHome = this.x - this.baseX;
                    this.x -= dxHome / 12;
                }
                if (this.y !== this.baseY) {
                    let dyHome = this.y - this.baseY;
                    this.y -= dyHome / 12;
                }
            }
        }
    }

    const initParticles = () => {
        particles = [];
        // Scale particle counts cleanly based on display size
        const numberOfParticles = Math.min(75, Math.floor((canvas.width * canvas.height) / 9000));
        
        for (let i = 0; i < numberOfParticles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let text = words[Math.floor(Math.random() * words.length)];
            particles.push(new Particle(x, y, text));
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
};

// Fire the hero sequence engine on load
initHeroVoidCanvas();

/**
 * TENFOUR COLLECTIVE - INTERACTIVE ENGINE (2026 SOURCE CODE)
 * Master Script Assembly
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiveTimecode();
    initCustomCursor();
    initVideoLightbox();
    initHeroFluidVoid();
    initMatrixSystem();
    initScrollRevealLens();
});

/* --- 1. LIVE SMT TIMECODE DISPLAY --- */
const initLiveTimecode = () => {
    const timecodeEl = document.getElementById('liveTimecode');
    if (!timecodeEl) return;

    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        // Simulate a rapid 24fps frame counter loop
        const frames = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        
        timecodeEl.textContent = `${hours}:${minutes}:${seconds}:${frames}`;
    }, 41); // Roughly 24 updates per second
};

/* --- 2. BRUTALIST CUSTOM CURSOR TRACKING --- */
const initCustomCursor = () => {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant hardware dot placement
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    // Smooth fluid interpolation loop for the visual text follower frame
    const renderFollower = () => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        requestAnimationFrame(renderFollower);
    };
    renderFollower();

    // Hover interactive scaling triggers
    const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .brutalist-slider');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            if(el.classList.contains('portfolio-item')) {
                follower.classList.add('follower-active');
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            follower.classList.remove('follower-active');
        });
    });
};

/* --- 3. CINEMATIC VIDEO LIGHTBOX SYSTEM --- */
const initVideoLightbox = () => {
    const lightbox = document.getElementById('videoLightbox');
    const player = document.getElementById('lightboxPlayer');
    const closeBtn = document.querySelector('.close-lightbox');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (!lightbox || !player) return;

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const videoPath = item.getAttribute('data-video-path');
            if (videoPath) {
                player.src = videoPath;
                lightbox.classList.add('lightbox-active');
                player.play();
            }
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('lightbox-active');
        player.pause();
        player.src = '';
    };

    closeBtn?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
};

/* --- 4. HIGH-PERFORMANCE FLUID PARTICLE VOID ENGINE (HERO BLOCK) --- */
const initHeroFluidVoid = () => {
    const canvas = document.getElementById('voidCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, oldX: null, oldY: null, vx: 0, vy: 0, radius: 180 };
    
    const characters = ["104", "RAW", "23.976", "4K", "REC", "FX3", "FX6", "LOG3", "T4", "//"];

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateParticleGrid();
    };

    class InteractiveParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            
            // Random assignment of raw text snippet symbols
            this.text = characters[Math.floor(Math.random() * characters.length)];
            this.fontSize = Math.floor(Math.random() * 4) + 10; // Crisp, micro digital font sizing
            this.opacity = Math.random() * 0.25 + 0.05; // Faint, subtle matrix grid aesthetic
            this.friction = Math.random() * 0.05 + 0.85; // Drag variable for organic kinetic inertia
            this.ease = Math.random() * 0.05 + 0.05; // Spring-back home flexibility calculation
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.font = `700 ${this.fontSize}px monospace`;
            ctx.fillText(this.text, this.x, this.y);
        }

        update() {
            // Compute structural interaction distances relative to mouse movement vectors
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                // Generate a visual ripple push proportionate to speed and location distance
                let force = (mouse.radius - distance) / mouse.radius;
                let pushX = (dx / distance) * force * 15;
                let pushY = (dy / distance) * force * 15;

                // Add mouse drag velocity vectors directly to particle trajectory speeds
                this.vx -= pushX - (mouse.vx * force * 0.5);
                this.vy -= pushY - (mouse.vy * force * 0.5);
            }

            // Apply friction equations to decay kinetic momentum
            this.vx *= this.friction;
            this.vy *= this.friction;
            
            // Apply coordinates velocity transformations
            this.x += this.vx;
            this.y += this.vy;

            // Fluid home anchor structural pull loop
            this.x += (this.baseX - this.x) * this.ease;
            this.y += (this.baseY - this.y) * this.ease;
        }
    }

    const generateParticleGrid = () => {
        particles = [];
        // Geometric micro grid generation framework layout mapping
        const spacing = 45; 
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                // Add minor geometric random noise offset to break pure linear layouts
                let jitterX = (Math.random() - 0.5) * 15;
                let jitterY = (Math.random() - 0.5) * 15;
                let x = c * spacing + (spacing / 2) + jitterX;
                let y = r * spacing + (spacing / 2) + jitterY;
                
                particles.push(new InteractiveParticle(x, y));
            }
        }
    };

    const renderLoop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Compute precise kinetic mouse sweep speeds across individual thread renders
        if (mouse.x !== null && mouse.oldX !== null) {
            mouse.vx = mouse.x - mouse.oldX;
            mouse.vy = mouse.y - mouse.oldY;
        }
        mouse.oldX = mouse.x;
        mouse.oldY = mouse.y;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.oldX = null;
        mouse.oldY = null;
        mouse.vx = 0;
        mouse.vy = 0;
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    renderLoop();
};

/* --- 5. BUDGET VS. VISION MATRIX MODULE --- */
const initMatrixSystem = () => {
    const budgetSlider = document.getElementById('budgetSlider');
    const freedomSlider = document.getElementById('freedomSlider');
    const budgetValue = document.getElementById('budgetValue');
    const freedomValue = document.getElementById('freedomValue');
    const strategyOutput = document.getElementById('strategyOutput');

    if (!budgetSlider || !freedomSlider) return;

    const budgetLabels = { 1: "GUERILLA INDIE", 2: "MID-TIER AGENCY", 3: "COMMERCIAL BLOCKBUSTER" };
    const freedomLabels = { 1: "SAFE & CORPORATE", 2: "COLLABORATIVE FLUID", 3: "PURE CHAOS" };

    const responseMatrix = {
        "1-1": "Tight specs, safe parameters. We optimize every dollar, locking down clean, straightforward digital content delivered without the fluff.",
        "1-2": "The indie sweet spot. We run a nimble run-and-gun crew, bouncing ideas off each other in real-time to maximize visual impact on a lean framework.",
        "1-3": "We grab our personal Sony FX3s, clear out the noise, jump on a flight, and direct via Discord. Raw, lightning-fast, hyper-authentic cinematic storytelling.",
        "2-1": "Structured commercial workflow. Full brand guideline adherence with precision timing, perfect blocking, and highly polished studio color grades.",
        "2-2": "Balanced scaling. A robust production footprint matched with dynamic lighting frameworks, allowing room to elevate the core creative message organically.",
        "2-3": "High energy workspace. We take a healthy production kit and push it to the edge—experimental camera transitions, heavy texturing, and stylized sound design.",
        "3-1": "Maximum precision engineering. High-end lifestyle styling, fully spec'd gear pipelines, and complex setups designed to land cleanly in major markets.",
        "3-2": "Premium collaborative execution. Massive sandbox playground. Cinema-grade glass, multi-cam arrays, and a fully realized post-production layout built to scale.",
        "3-3": "Absolute creative control. Huge resources met with zero boundaries. We build complex visual worlds, smash conventional editing rules, and let the work make its own noise."
    };

    const updateMatrixResult = () => {
        const bVal = budgetSlider.value;
        const fVal = freedomSlider.value;
        
        budgetValue.textContent = budgetLabels[bVal];
        freedomValue.textContent = freedomLabels[fVal];
        
        const lookupKey = `${bVal}-${fVal}`;
        
        strategyOutput.style.opacity = '0.2';
        setTimeout(() => {
            strategyOutput.textContent = responseMatrix[lookupKey];
            strategyOutput.style.opacity = '1';
        }, 100);
    };

    budgetSlider.addEventListener('input', updateMatrixResult);
    freedomSlider.addEventListener('input', updateMatrixResult);
};

/* --- 6. BEHIND THE LENS SCROLL REVEAL OPTICAL FILTER --- */
const initScrollRevealLens = () => {
    const wrappers = document.querySelectorAll('.reveal-scanner');
    if (wrappers.length === 0) return;

    const handleLensScroll = () => {
        const viewHeight = window.innerHeight;
        const triggerZone = viewHeight * 0.5; // Trigger horizontal crosshair center marker line

        wrappers.forEach(wrapper => {
            const rect = wrapper.getBoundingClientRect();
            
            if (rect.top < viewHeight && rect.bottom > 0) {
                const relativeIntersection = (triggerZone - rect.top) / rect.height;
                const percentage = Math.min(Math.max(relativeIntersection * 100, 0), 100);
                const invertedPercentage = 100 - percentage;

                wrapper.style.setProperty('--scan-split', `${invertedPercentage}%`);
                wrapper.style.setProperty('--scan-display', 'block');
            } else {
                wrapper.style.setProperty('--scan-display', 'none');
            }
        });
    };

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(handleLensScroll);
    });
    handleLensScroll();
};

