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

    /* --- 2. Custom Cursor Mechanics --- */
    const cursorDot = document.getElementById("customCursor");
    const cursorFollower = document.getElementById("cursorFollower");

    if (cursorDot && cursorFollower) {
        document.addEventListener("mousemove", (e) => {
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        });

        portfolioItems.forEach(item => {
            item.addEventListener("mouseenter", () => {
                document.body.classList.add("hovering-portfolio");
            });
            item.addEventListener("mouseleave", () => {
                document.body.classList.remove("hovering-portfolio");
            });
        });

        document.addEventListener("mouseleave", () => {
            cursorDot.style.opacity = "0";
            cursorFollower.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            cursorDot.style.opacity = "1";
            cursorFollower.style.opacity = "1";
        });
    }

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