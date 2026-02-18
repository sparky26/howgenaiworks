import { NARRATIONS } from '../config.js';

export default {
    _animationId: null,
    _nodes: [],
    _shockwaves: [],
    _timeouts: [],
    _independentTweens: [],
    _canvasRunning: false,

    build(container) {
        const style = document.createElement('style');
        style.textContent = `
            .s6-wrapper {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }

            .s6-counter-row {
                display: flex;
                align-items: baseline;
                gap: 12px;
                justify-content: center;
            }

            .s6-counter-label {
                font-family: var(--font-body);
                font-size: 14px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .s6-counter-value {
                font-family: var(--font-mono);
                font-size: 34px;
                font-weight: 700;
                color: var(--accent-orange);
                text-shadow: 0 0 40px rgba(249, 115, 22, 0.4),
                             0 0 80px rgba(249, 115, 22, 0.2);
                letter-spacing: -0.02em;
                min-width: min(320px, 80vw);
                text-align: center;
                transition: text-shadow 0.3s ease;
            }

            .s6-counter-value.s6-flash {
                text-shadow: 0 0 60px rgba(249, 115, 22, 0.8),
                             0 0 120px rgba(249, 115, 22, 0.4);
            }

            .s6-canvas-wrap {
                position: relative;
                width: 100%;
                max-width: 700px;
                height: 240px;
                border-radius: 16px;
                overflow: hidden;
            }

            .s6-canvas {
                width: 100%;
                height: 100%;
                display: block;
                border-radius: 16px;
            }

            .s6-stats {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
                opacity: 0;
            }

            .s6-stat {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                background: color-mix(in srgb, var(--accent-orange) 8%, transparent);
                border: 1px solid color-mix(in srgb, var(--accent-orange) 25%, transparent);
                border-radius: 10px;
                font-family: var(--font-mono);
                font-size: 14px;
                color: var(--accent-orange);
                backdrop-filter: blur(4px);
                transition: all 0.3s ease;
            }

            .s6-stat:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(249, 115, 22, 0.15);
            }

            @media (max-width: 600px) {
                .s6-counter-value {
                    font-size: 28px;
                    min-width: 200px;
                }
                .s6-canvas-wrap {
                    height: 180px;
                }
            }
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.innerHTML = `
            <div class="step-subtitle">Step 6</div>
            <h1 class="step-title">The Power of Scale</h1>
            <div class="step-visual s6-wrapper">
                <div class="s6-counter-row">
                    <span class="s6-counter-label">Parameters:</span>
                    <span class="s6-counter-value" id="s6-counter">1,000</span>
                </div>
                <div class="s6-canvas-wrap">
                    <canvas class="s6-canvas" id="s6-canvas"></canvas>
                </div>
                <div class="s6-stats" id="s6-stats">
                    <div class="s6-stat">Training data: trillions of words from the internet</div>
                    <div class="s6-stat">Training cost: tens of millions of dollars</div>
                    <div class="s6-stat">Knowledge cutoff: training data has a fixed end date</div>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step6}</p>
        `;

        wrapper.prepend(style);
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();

        // ---- Header ----
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');

        // ---- Show counter and canvas ----
        tl.from('.s6-counter-row', { opacity: 0, y: 15, duration: 0.4 });
        tl.from('.s6-canvas-wrap', { opacity: 0, scale: 0.95, duration: 0.5 }, '-=0.2');

        // ---- Start canvas with single glowing node ----
        tl.call(() => this._initCanvas());

        // ---- Exponential growth sequence ----
        const paramSteps = [
            { raw: 1000,          display: '1,000' },
            { raw: 10000,         display: '10,000' },
            { raw: 1000000,       display: '1,000,000' },
            { raw: 100000000,     display: '100,000,000' },
            { raw: 1000000000,    display: '1,000,000,000' },
            { raw: 175000000000,  display: '175,000,000,000' },
            { raw: 1760000000000, display: '1,760,000,000,000' },
        ];

        // First step is already displayed; animate from step index 1 onward
        // but we still do the first burst for the single-node -> small cluster
        paramSteps.forEach((step, i) => {
            tl.call(() => {
                this._growthBurst(i, paramSteps.length);
                this._animateCounter(step.raw, step.display);
            }, null, i === 0 ? '+=0.6' : '+=0.8');
        });

        // ---- After growth: show stats ----
        tl.to('#s6-stats', { opacity: 1, duration: 0.5, delay: 0.8 });
        tl.from('.s6-stat', {
            opacity: 0, y: 20, stagger: 0.2, duration: 0.4,
        }, '-=0.3');

        // ---- Narration ----
        tl.from('.step-narration', { opacity: 0, y: 20, duration: 0.6 });

        return tl;
    },

    // ======================================================================
    // Canvas initialization
    // ======================================================================
    _initCanvas() {
        const canvas = document.getElementById('s6-canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;

        this._canvasW = w;
        this._canvasH = h;
        this._ctx = ctx;
        this._dpr = dpr;
        this._canvasEl = canvas;
        this._canvasRunning = true;

        // Start with a single glowing node at center
        this._nodes = [{
            x: w / 2,
            y: h / 2,
            vx: 0,
            vy: 0,
            radius: 5,
            opacity: 1,
            birth: Date.now(),
        }];

        this._shockwaves = [];

        // Spawn a gentle pulse on the initial node independently
        const pulseProxy = { scale: 1 };
        const pulseTween = gsap.to(pulseProxy, {
            scale: 1.6,
            duration: 1.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                if (this._nodes.length > 0 && this._nodes.length <= 3) {
                    this._nodes[0].radius = 5 * pulseProxy.scale;
                }
            },
        });
        this._independentTweens.push(pulseTween);

        // Start render loop
        this._renderCanvas();
    },

    // ======================================================================
    // Render loop
    // ======================================================================
    _renderCanvas() {
        if (!this._canvasRunning) return;

        const ctx = this._ctx;
        const w = this._canvasW;
        const h = this._canvasH;
        if (!ctx) return;

        ctx.clearRect(0, 0, w, h);

        // ---- Subtle radial background gradient ----
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
        bgGrad.addColorStop(0, 'rgba(20, 12, 5, 0.6)');
        bgGrad.addColorStop(0.5, 'rgba(15, 10, 5, 0.3)');
        bgGrad.addColorStop(1, 'rgba(25, 18, 10, 0.15)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const now = Date.now();

        // ---- Update node positions ----
        for (const node of this._nodes) {
            // Slight gravitational pull toward center
            const dx = cx - node.x;
            const dy = cy - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const pullStrength = 0.00025;
            node.vx += (dx / dist) * pullStrength * dist;
            node.vy += (dy / dist) * pullStrength * dist;

            // Damping
            node.vx *= 0.995;
            node.vy *= 0.995;

            // Slight random drift
            node.vx += (Math.random() - 0.5) * 0.04;
            node.vy += (Math.random() - 0.5) * 0.04;

            node.x += node.vx;
            node.y += node.vy;

            // Soft boundary
            const margin = 15;
            if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
            if (node.x > w - margin) { node.x = w - margin; node.vx *= -0.5; }
            if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
            if (node.y > h - margin) { node.y = h - margin; node.vy *= -0.5; }
        }

        // ---- Draw connections (performance-limited) ----
        const maxConnDraw = 400;
        let connCount = 0;
        const nodeCount = this._nodes.length;
        // Adaptive max distance based on node density
        const maxDist = Math.max(35, 130 - nodeCount * 0.18);

        // Use spatial bucketing for performance when many nodes
        if (nodeCount > 100) {
            // Simple grid hash
            const cellSize = maxDist;
            const grid = {};
            for (let i = 0; i < nodeCount; i++) {
                const n = this._nodes[i];
                const gx = Math.floor(n.x / cellSize);
                const gy = Math.floor(n.y / cellSize);
                const key = gx + ',' + gy;
                if (!grid[key]) grid[key] = [];
                grid[key].push(i);
            }

            const checked = new Set();
            for (let i = 0; i < nodeCount && connCount < maxConnDraw; i++) {
                const n = this._nodes[i];
                const gx = Math.floor(n.x / cellSize);
                const gy = Math.floor(n.y / cellSize);

                // Check neighboring cells
                for (let ox = -1; ox <= 1 && connCount < maxConnDraw; ox++) {
                    for (let oy = -1; oy <= 1 && connCount < maxConnDraw; oy++) {
                        const neighbors = grid[(gx + ox) + ',' + (gy + oy)];
                        if (!neighbors) continue;
                        for (let k = 0; k < neighbors.length && connCount < maxConnDraw; k++) {
                            const j = neighbors[k];
                            if (j <= i) continue;
                            const pairKey = i * 10000 + j;
                            if (checked.has(pairKey)) continue;
                            checked.add(pairKey);

                            const ndx = n.x - this._nodes[j].x;
                            const ndy = n.y - this._nodes[j].y;
                            const d = Math.sqrt(ndx * ndx + ndy * ndy);
                            if (d < maxDist) {
                                const alpha = (1 - d / maxDist) * 0.18;
                                ctx.beginPath();
                                ctx.moveTo(n.x, n.y);
                                ctx.lineTo(this._nodes[j].x, this._nodes[j].y);
                                ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
                                ctx.lineWidth = 0.5;
                                ctx.stroke();
                                connCount++;
                            }
                        }
                    }
                }
            }
        } else {
            // Brute force for small node counts
            for (let i = 0; i < nodeCount && connCount < maxConnDraw; i++) {
                for (let j = i + 1; j < nodeCount && connCount < maxConnDraw; j++) {
                    const dx = this._nodes[i].x - this._nodes[j].x;
                    const dy = this._nodes[i].y - this._nodes[j].y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < maxDist) {
                        const alpha = (1 - d / maxDist) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(this._nodes[i].x, this._nodes[i].y);
                        ctx.lineTo(this._nodes[j].x, this._nodes[j].y);
                        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                        connCount++;
                    }
                }
            }
        }

        // ---- Draw nodes ----
        for (const node of this._nodes) {
            const distFromCenter = Math.sqrt(
                (node.x - cx) * (node.x - cx) + (node.y - cy) * (node.y - cy)
            );
            const maxRadius = Math.max(w, h) * 0.5;
            const edgeFade = Math.max(0.2, 1 - (distFromCenter / maxRadius) * 0.6);
            const finalOpacity = node.opacity * edgeFade;

            // Glow halo
            const glow = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 4
            );
            glow.addColorStop(0, `rgba(249, 115, 22, ${finalOpacity * 0.25})`);
            glow.addColorStop(0.5, `rgba(249, 115, 22, ${finalOpacity * 0.08})`);
            glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core bright dot
            const coreGrad = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius
            );
            coreGrad.addColorStop(0, `rgba(255, 200, 140, ${finalOpacity})`);
            coreGrad.addColorStop(0.6, `rgba(249, 115, 22, ${finalOpacity * 0.9})`);
            coreGrad.addColorStop(1, `rgba(249, 115, 22, ${finalOpacity * 0.3})`);
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.fill();
        }

        // ---- Draw shockwaves ----
        for (let i = this._shockwaves.length - 1; i >= 0; i--) {
            const sw = this._shockwaves[i];
            const elapsed = (now - sw.birth) / sw.duration;
            if (elapsed >= 1) {
                this._shockwaves.splice(i, 1);
                continue;
            }
            const radius = sw.maxRadius * elapsed;
            const alpha = (1 - elapsed) * 0.35;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(249, 155, 50, ${alpha})`;
            ctx.lineWidth = 2 * (1 - elapsed);
            ctx.stroke();

            // Inner glow ring
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.4})`;
            ctx.lineWidth = 6 * (1 - elapsed);
            ctx.stroke();
        }

        this._animationId = requestAnimationFrame(() => this._renderCanvas());
    },

    // ======================================================================
    // Growth burst — adds nodes in a shockwave pattern
    // ======================================================================
    _growthBurst(burstIndex, totalBursts) {
        const w = this._canvasW;
        const h = this._canvasH;
        if (!w) return;

        const cx = w / 2;
        const cy = h / 2;

        // How many nodes to add this burst — exponential growth
        const addCounts = [4, 10, 25, 50, 80, 120, 200];
        const addCount = addCounts[Math.min(burstIndex, addCounts.length - 1)];

        // Radius of this burst ring grows each step
        const burstRadius = 30 + burstIndex * 35;
        const nodeSize = Math.max(1.2, 4.5 - burstIndex * 0.5);
        const nodeOpacity = Math.max(0.35, 1 - burstIndex * 0.1);

        // Add nodes distributed in a ring around center
        const newNodes = [];
        for (let i = 0; i < addCount; i++) {
            const angle = (Math.PI * 2 * i) / addCount + (Math.random() - 0.5) * 0.5;
            const r = burstRadius + (Math.random() - 0.5) * burstRadius * 0.6;
            const nx = cx + Math.cos(angle) * r;
            const ny = cy + Math.sin(angle) * r;

            newNodes.push({
                x: cx + (Math.random() - 0.5) * 10, // Start near center
                y: cy + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * (1.5 + Math.random()),
                vy: Math.sin(angle) * (1.5 + Math.random()),
                targetX: nx,
                targetY: ny,
                radius: nodeSize,
                opacity: 0, // Will fade in
                birth: Date.now(),
            });
        }

        this._nodes.push(...newNodes);

        // Cap at 500 for performance
        if (this._nodes.length > 500) {
            this._nodes = this._nodes.slice(-500);
        }

        // Fade in new nodes
        const fadeProxy = { val: 0 };
        const fadeTween = gsap.to(fadeProxy, {
            val: nodeOpacity,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: () => {
                for (const n of newNodes) {
                    if (this._nodes.includes(n)) {
                        n.opacity = fadeProxy.val;
                    }
                }
            },
        });
        this._independentTweens.push(fadeTween);

        // Add shockwave ring
        this._shockwaves.push({
            birth: Date.now(),
            maxRadius: burstRadius * 1.8 + 40,
            duration: 1200 + burstIndex * 100,
        });

        // Screen shake effect on the counter
        const counterEl = document.getElementById('s6-counter');
        if (counterEl) {
            counterEl.classList.add('s6-flash');
            const tid = setTimeout(() => counterEl.classList.remove('s6-flash'), 400);
            this._timeouts.push(tid);
        }
    },

    // ======================================================================
    // Number spinning counter animation
    // ======================================================================
    _animateCounter(targetValue, targetDisplay) {
        const counterEl = document.getElementById('s6-counter');
        if (!counterEl) return;

        // Number spinning effect: rapidly cycle random digits then settle
        const spinDuration = 0.5;
        const spinFrames = 12;
        let frame = 0;

        const digitCount = targetDisplay.replace(/,/g, '').length;

        const spinInterval = () => {
            if (frame >= spinFrames) {
                // Settle to final value
                counterEl.textContent = targetDisplay;
                return;
            }
            // Generate random digits of same length
            let randomNum = '';
            for (let i = 0; i < digitCount; i++) {
                randomNum += Math.floor(Math.random() * 10);
            }
            // Format with commas
            randomNum = randomNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            counterEl.textContent = randomNum;
            frame++;

            const tid = setTimeout(spinInterval, (spinDuration * 1000) / spinFrames);
            this._timeouts.push(tid);
        };

        spinInterval();

        // Also do a scale pop via GSAP
        const popTween = gsap.fromTo(counterEl,
            { scale: 1.15 },
            { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
        );
        this._independentTweens.push(popTween);
    },

    // ======================================================================
    // Cleanup
    // ======================================================================
    cleanup() {
        // Stop canvas rendering
        this._canvasRunning = false;
        if (this._animationId) {
            cancelAnimationFrame(this._animationId);
            this._animationId = null;
        }

        // Clear all timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill all independent tweens
        this._independentTweens.forEach(tw => {
            if (tw && typeof tw.kill === 'function') tw.kill();
        });
        this._independentTweens = [];

        // Reset state
        this._nodes = [];
        this._shockwaves = [];
        this._ctx = null;
        this._canvasEl = null;

        // Kill any remaining GSAP tweens on our elements
        gsap.killTweensOf('#s6-counter');
        gsap.killTweensOf('.s6-canvas-wrap');
        gsap.killTweensOf('.s6-stat');
        gsap.killTweensOf('#s6-stats');
    },
};
