export class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.accentColor = { r: 74, g: 158, b: 255 };
        this.targetColor = { r: 74, g: 158, b: 255 };
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    initParticles() {
        const count = Math.floor(Math.min(window.innerWidth * 0.06, 100));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
            });
        }
    }

    setAccentColor(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        this.targetColor = { r, g, b };
    }

    lerpColor() {
        const speed = 0.02;
        this.accentColor.r += (this.targetColor.r - this.accentColor.r) * speed;
        this.accentColor.g += (this.targetColor.g - this.accentColor.g) * speed;
        this.accentColor.b += (this.targetColor.b - this.accentColor.b) * speed;
    }

    draw() {
        const { ctx, canvas, particles, accentColor } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.lerpColor();

        const r = Math.round(accentColor.r);
        const g = Math.round(accentColor.g);
        const b = Math.round(accentColor.b);

        // Update and draw particles
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            ctx.fill();
        }

        // Draw connections
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.draw());
    }

    start() {
        if (!this.animationId) {
            this.draw();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
