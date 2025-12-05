// script.js

// ------------------------------------
// 1. Cursor Particle Effect (Fixed + DPR support)
// ------------------------------------

const canvas = document.getElementById('cursor-canvas');
let ctx = null;
let particles = [];
let mouse = { x: null, y: null };
let dpr = window.devicePixelRatio || 1;
let cssWidth = window.innerWidth;
let cssHeight = window.innerHeight;

function resizeCanvas() {
    if (!canvas) return;
    dpr = window.devicePixelRatio || 1;
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;
    // Set CSS size (what the user sees)
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    // Set actual drawing buffer size for high-DPI
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Map drawing coordinates to CSS pixels (avoid accumulating scales)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Update mouse position and spawn particles
window.addEventListener('mousemove', (e) => {
    if (!canvas || !ctx) return;
    // Use clientX/clientY for consistent coordinates relative to viewport
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    for (let i = 0; i < 4; i++) { // Spawn a few particles on mouse move
        particles.push(new Particle(mouse.x, mouse.y));
    }
});

class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.size = opts.size || (Math.random() * 6 + 1);
        this.speedX = opts.speedX !== undefined ? opts.speedX : (Math.random() - 0.5) * 6;
        this.speedY = opts.speedY !== undefined ? opts.speedY : (Math.random() - 0.5) * 6;
        this.color = opts.color || ('rgba(0,191,255,' + (0.7 + Math.random()*0.3) + ')');
        this.life = opts.life || (45 + Math.floor(Math.random() * 30));
        this.shape = opts.shape || 'circle'; // 'circle' or 'heart'
        this.rotation = opts.rotation || 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.97;
        this.speedY *= 0.97;
        this.life -= 1;
        if (this.size > 0.2) this.size *= 0.96;
        this.rotation += 0.05;
    }

    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.shape === 'heart') {
            drawHeart(ctx, this.size, this.color);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Helper: draw a small heart shape centered at 0,0
function drawHeart(ctx, size, color) {
    const s = Math.max(1, size / 6);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -4 * s);
    ctx.bezierCurveTo(6*s, -12*s, 24*s, -4*s, 0, 16*s);
    ctx.bezierCurveTo(-24*s, -4*s, -6*s, -12*s, 0, -4*s);
    ctx.closePath();
    ctx.fill();
}

function handleParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        // Remove dead particles
        if (p.life <= 0 || p.size <= 0.3) {
            particles.splice(i, 1);
        }
    }
}

// Spawn a burst of heart-shaped particles at (x,y) in CSS pixels
function spawnHeartBurst(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - (1 + Math.random()*1.5); // bias upward
        const size = 6 + Math.random() * 8;
        const color = `rgba(255,${60 + Math.floor(Math.random()*140)},${160 + Math.floor(Math.random()*80)},${0.85 - Math.random()*0.35})`;
        particles.push(new Particle(x, y, { shape: 'heart', speedX: vx, speedY: vy, size, color, life: 60 + Math.floor(Math.random()*30) }));
    }
}

// Spawn a burst of small sparkle circle particles
function spawnSparkles(x, y, count = 14) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 2.4;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - (0.6 + Math.random()*0.6);
        const size = 2 + Math.random() * 4;
        const t = Math.floor(Math.random()*120);
        const alpha = 0.7 + Math.random()*0.3;
        const colors = [ 'rgba(0,191,255,'+alpha+')', 'rgba(160,240,255,'+alpha+')', 'rgba(180,255,220,'+alpha+')' ];
        const color = colors[Math.floor(Math.random()*colors.length)];
        particles.push(new Particle(x, y, { shape: 'circle', speedX: vx, speedY: vy, size, color, life: 30 + Math.floor(Math.random()*40) }));
    }
}

function animate() {
    if (!ctx) {
        requestAnimationFrame(animate);
        return;
    }
    // Clear using CSS pixel dimensions (ctx is transformed to DPR)
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    handleParticles();
    requestAnimationFrame(animate);
}

// Start the animation loop
animate();


// ------------------------------------
// 2. Scroll Reveal Effect
// ------------------------------------

const revealElements = document.querySelectorAll('.reveal');

function checkReveal() {
    for (let i = 0; i < revealElements.length; i++) {
        const element = revealElements[i];
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // If the top of the element is visible in the viewport
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        } else {
            // Optional: remove 'visible' class when scrolling back up
            element.classList.remove('visible');
        }
    }
}

window.addEventListener('scroll', checkReveal);
window.addEventListener('load', checkReveal); // Run on load to check initial visibility


// ------------------------------------
// 3. Section Interactivity (Template Change)
// ------------------------------------

const eduSection = document.getElementById('edu');

if (eduSection) {
    // 1. Create the button element
    const changeTemplateButton = document.createElement('button');
    changeTemplateButton.textContent = 'Switch Education View';
    changeTemplateButton.classList.add('template-switch-btn');
    
    // 2. Append the button to the feature-text div
    const eduFeatureText = eduSection.querySelector('.feature-text');
    eduFeatureText.appendChild(changeTemplateButton);

    // 3. Add the new CSS for the button (you'll need to add this to style.css)
    // For now, apply minimal inline styling for visibility
    changeTemplateButton.style.marginTop = '20px';
    changeTemplateButton.style.padding = '10px 15px';
    changeTemplateButton.style.background = '#00bfff';
    changeTemplateButton.style.color = 'white';
    changeTemplateButton.style.border = 'none';
    changeTemplateButton.style.borderRadius = '8px';
    changeTemplateButton.style.cursor = 'pointer';
    changeTemplateButton.style.transition = '0.3s';
    
    // 4. Add the click event listener
    changeTemplateButton.addEventListener('click', () => {
        eduSection.classList.toggle('template-alt');
        
        // Change button text based on current state
        if (eduSection.classList.contains('template-alt')) {
            changeTemplateButton.textContent = 'Revert Education View';
        } else {
            changeTemplateButton.textContent = 'Switch Education View';
        }
    });
}

// ------------------------------------
// 4. Memory item click interaction
// ------------------------------------
function initMemoryInteractions() {
    const memoryItems = document.querySelectorAll('.memory-item');
    if (!memoryItems || memoryItems.length === 0) return;

    memoryItems.forEach(item => {
        item.style.cursor = 'pointer';
        // create a small heart icon element
        let icon = item.querySelector('.like-icon');
        if (!icon) {
            icon = document.createElement('span');
            icon.className = 'like-icon';
            icon.innerHTML = '♡';
            icon.style.marginLeft = '8px';
            icon.style.color = 'rgba(255,255,255,0.7)';
            item.appendChild(icon);
        }

        item.addEventListener('click', (e) => {
            // Toggle liked state
            const liked = item.classList.toggle('liked');
            icon.innerHTML = liked ? '❤️' : '♡';

            // Compute the center of the item for particle burst
            const rect = item.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            // Spawn heart burst at that location
            spawnHeartBurst(x, y, liked ? 30 : 16);
        });
    });
}

// Run initialization after a short delay to ensure DOM elements exist
window.addEventListener('DOMContentLoaded', () => setTimeout(initMemoryInteractions, 120));

// Initialize profile badge interactions (sparkle on click)
function initProfileInteractions() {
    const badge = document.querySelector('.profile-badge');
    if (!badge) return;
    const btn = badge.querySelector('.profile-action');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        // compute center of badge
        const rect = badge.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        // small sparkle burst
        spawnSparkles(x, y, 18);
        // quick 'wave' pulse via CSS class
        badge.classList.add('pulse-click');
        setTimeout(() => badge.classList.remove('pulse-click'), 380);
    });

    // optional: small ambient sparkles on hover
    badge.addEventListener('mouseenter', () => {
        const rect = badge.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        spawnSparkles(x, y, 8);
    });
}

window.addEventListener('DOMContentLoaded', () => setTimeout(initProfileInteractions, 220));

// ------------------------------------
// 6. Cursor Hover Glow on Section Boxes
// ------------------------------------

function initSectionGlows() {
    const sectionSelectors = [
        '.feature',
        '#early',
        '#edu',
        '#growth',
        '.interest-card',
        '.place-card',
        '.memory-item',
        '.intro-card',
        '.quote-section',
        '.memories-section',
        '.tribute-layout',
        '.roadmap-layout'
    ];

    sectionSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.classList.add('glow-active');
            });
            el.addEventListener('mouseleave', () => {
                el.classList.remove('glow-active');
            });
        });
    });
}

window.addEventListener('DOMContentLoaded', () => setTimeout(initSectionGlows, 320));