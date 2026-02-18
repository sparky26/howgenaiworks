import { PREDICTION_ROUNDS, NARRATIONS } from '../config.js';

export default {
    _temperatureCleanup: null,
    _timeouts: [],
    _independentTweens: [],
    _animFrameId: null,
    _neuralRunning: false,
    _neuralSpeed: 1,

    build(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';

        // Inject scoped styles
        const style = document.createElement('style');
        style.textContent = `
            .s5-neural-canvas {
                width: min(260px, 70vw);
                height: 60px;
                border-radius: 12px;
                border: 1px solid rgba(34, 197, 94, 0.15);
                background: rgba(0, 0, 0, 0.3);
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.05);
            }

            .s5-glass-input {
                font-family: var(--font-mono);
                font-size: 18px;
                color: var(--text-accent);
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(34, 197, 94, 0.2);
                border-radius: 14px;
                padding: 12px 20px;
                width: 100%;
                max-width: 520px;
                position: relative;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25),
                            inset 0 1px 0 rgba(255, 255, 255, 0.05);
                overflow: hidden;
            }

            .s5-glass-input::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.25), transparent);
            }

            .s5-char-glow {
                display: inline;
                position: relative;
            }

            .s5-char-flash {
                color: #4ade80;
                text-shadow: 0 0 12px rgba(74, 222, 128, 0.8);
                transition: color 0.4s ease, text-shadow 0.4s ease;
            }

            .s5-char-settled {
                color: var(--text-accent);
                text-shadow: none;
            }

            .s5-pred-label {
                font-family: var(--font-body);
                font-size: 14px;
                color: var(--text-secondary);
                text-align: center;
                opacity: 0;
            }

            .s5-bar-container {
                width: 100%;
                max-width: 480px;
            }

            .s5-bar {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 6px;
                padding: 4px 0;
                border-radius: 6px;
                position: relative;
            }

            .s5-bar:first-child {
                padding: 6px 8px;
                background: rgba(34, 197, 94, 0.04);
                border-radius: 8px;
            }

            .s5-bar-label {
                font-family: var(--font-mono);
                font-size: 15px;
                font-weight: 500;
                width: 80px;
                text-align: right;
                color: var(--text-primary);
            }

            .s5-bar:first-child .s5-bar-label {
                color: var(--accent-green);
            }

            .s5-bar-track {
                flex: 1;
                height: 26px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }

            .s5-bar-fill {
                height: 100%;
                border-radius: 8px;
                position: relative;
                width: 0%;
            }

            .s5-bar-fill::after {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
                border-radius: 8px 8px 0 0;
            }

            .s5-bar-dot {
                position: absolute;
                right: -4px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4ade80;
                box-shadow: 0 0 10px rgba(74, 222, 128, 0.8), 0 0 20px rgba(74, 222, 128, 0.4);
                opacity: 0;
                z-index: 2;
            }

            .s5-bar-value {
                font-family: var(--font-mono);
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                width: 45px;
            }

            .s5-bar:first-child .s5-bar-value {
                color: var(--accent-green);
            }

            .s5-slider-panel {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 14px 22px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(34, 197, 94, 0.12);
                border-radius: 14px;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                opacity: 0;
                position: relative;
            }

            .s5-slider-panel::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent);
            }

            .s5-slider-panel label {
                font-family: var(--font-body);
                font-size: 13px;
                color: var(--text-secondary);
                white-space: nowrap;
            }

            .s5-slider-panel input[type="range"] {
                -webkit-appearance: none;
                width: 180px;
                height: 4px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 2px;
                outline: none;
            }

            .s5-slider-panel input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--accent-green);
                cursor: pointer;
                box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
                transition: box-shadow 0.2s ease;
            }

            .s5-slider-panel input[type="range"]::-webkit-slider-thumb:hover {
                box-shadow: 0 0 20px rgba(34, 197, 94, 0.7);
            }

            .s5-temp-value {
                font-family: var(--font-mono);
                font-size: 14px;
                font-weight: 600;
                color: var(--accent-green);
                min-width: 30px;
            }

            .s5-temp-label {
                font-family: var(--font-body);
                font-size: 13px;
                color: var(--text-secondary);
                margin-left: 4px;
                min-width: 90px;
            }

            .s5-flying-word {
                position: fixed;
                font-family: var(--font-mono);
                font-size: 16px;
                color: #4ade80;
                font-weight: 700;
                z-index: 1000;
                pointer-events: none;
                text-shadow: 0 0 12px rgba(74, 222, 128, 0.6);
            }

            .s5-trail-ghost {
                position: fixed;
                font-family: var(--font-mono);
                font-size: 16px;
                color: #4ade80;
                font-weight: 700;
                z-index: 999;
                pointer-events: none;
                opacity: 0.5;
            }

            .s5-landing-flash {
                position: fixed;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(74, 222, 128, 0.8) 0%, transparent 70%);
                z-index: 1001;
                pointer-events: none;
                transform: translate(-50%, -50%);
            }

            @keyframes s5-pulse-glow {
                0%, 100% { box-shadow: 0 0 8px rgba(34, 197, 94, 0.15); }
                50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.35), 0 0 40px rgba(34, 197, 94, 0.15); }
            }
        `;

        wrapper.innerHTML = `
            <div class="step-subtitle">Step 5</div>
            <h1 class="step-title">Predicting the Next Word</h1>
            <div class="step-visual" style="flex-direction: column; gap: 10px; align-items: center;">
                <!-- Neural thinking canvas -->
                <canvas class="s5-neural-canvas" id="s5-neural-canvas" width="600" height="160"></canvas>

                <!-- Glass-panel text input -->
                <div class="s5-glass-input" id="s5-input">
                    <span class="s5-pred-text" id="s5-pred-text"></span><span class="sim-cursor"></span>
                </div>

                <div class="s5-pred-label" id="s5-pred-label">Model's predictions for next word:</div>

                <!-- Probability bars -->
                <div class="s5-bar-container" id="s5-bars"></div>

                <!-- Temperature slider in glass panel -->
                <div class="s5-slider-panel" id="s5-temp-slider">
                    <label>Temperature:</label>
                    <input type="range" min="0" max="2" step="0.1" value="1" id="s5-temp-range">
                    <span class="s5-temp-value" id="s5-temp-value">1.0</span>
                    <span class="s5-temp-label" id="s5-temp-label">Balanced</span>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step5}</p>
        `;

        wrapper.prepend(style);
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();
        const predText = document.getElementById('s5-pred-text');

        // ---- Header ----
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');

        // ---- Show neural canvas ----
        tl.from('#s5-neural-canvas', { opacity: 0, y: 10, duration: 0.5 });

        // ---- Show input ----
        tl.from('#s5-input', { opacity: 0, y: 10, duration: 0.4 }, '-=0.2');

        // ---- Show prediction label ----
        tl.to('#s5-pred-label', { opacity: 1, duration: 0.3 });

        // ---- Prediction rounds ----
        PREDICTION_ROUNDS.forEach((round, roundIdx) => {
            // Start neural network thinking
            tl.call(() => {
                this._startNeuralAnimation();
            });

            // Type input text character by character with glow
            tl.call(() => {
                this._typeTextWithGlow(predText, round.input);
            });
            tl.to({}, { duration: round.input.length * 0.045 + 0.6 });

            // Show probability bars
            tl.call(() => {
                this._showBars(round.predictions);
            });
            tl.to({}, { duration: 1.8 });

            // Stop neural thinking
            tl.call(() => {
                this._stopNeuralAnimation();
            });

            // Fly selected word to input with trail
            tl.call(() => {
                this._flyWordToInput(round.selected, predText);
            });
            tl.to({}, { duration: 1.0 });

            // Clear bars for next round
            if (roundIdx < PREDICTION_ROUNDS.length - 1) {
                tl.call(() => {
                    this._clearBars();
                });
                tl.to({}, { duration: 0.4 });
            }
        });

        // ---- Temperature slider ----
        tl.to('#s5-temp-slider', { opacity: 1, duration: 0.5, delay: 0.3 });
        tl.call(() => this._bindTemperatureSlider());

        // ---- Narration ----
        tl.from('.step-narration', { opacity: 0, y: 20, duration: 0.6 });

        return tl;
    },

    // ==========================================================================
    // Neural Network Canvas Animation
    // ==========================================================================

    _initNeuralNetwork() {
        // Define a 3-layer network: 4-6-4 nodes
        const layers = [4, 6, 4];
        const canvasW = 300;
        const canvasH = 80;
        const padX = 40;
        const padY = 12;
        const layerSpacing = (canvasW - padX * 2) / (layers.length - 1);

        this._nnNodes = [];
        this._nnConnections = [];

        // Create node positions
        layers.forEach((count, li) => {
            const x = padX + li * layerSpacing;
            const totalH = canvasH - padY * 2;
            const spacing = totalH / (count + 1);
            for (let ni = 0; ni < count; ni++) {
                const y = padY + spacing * (ni + 1);
                this._nnNodes.push({ x, y, layer: li });
            }
        });

        // Create connections between adjacent layers
        let nodeIdx = 0;
        for (let li = 0; li < layers.length - 1; li++) {
            const fromCount = layers[li];
            const toCount = layers[li + 1];
            const fromStart = nodeIdx;
            nodeIdx += fromCount;
            const toStart = nodeIdx;

            for (let fi = 0; fi < fromCount; fi++) {
                for (let ti = 0; ti < toCount; ti++) {
                    this._nnConnections.push({
                        from: this._nnNodes[fromStart + fi],
                        to: this._nnNodes[toStart + ti],
                    });
                }
            }
        }
        // Advance past last layer
        nodeIdx += layers[layers.length - 1];

        // Pulses: travelling signals
        this._nnPulses = [];
    },

    _startNeuralAnimation() {
        if (this._animFrameId) return; // already running
        if (!this._nnNodes) this._initNeuralNetwork();

        this._neuralRunning = true;
        this._nnPulses = [];

        const canvas = document.getElementById('s5-neural-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Size the canvas for crisp rendering
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;

        // Scale factors from our design coords (300x80) to actual canvas
        const sx = W / 300;
        const sy = H / 80;

        let lastSpawn = 0;
        const spawnInterval = () => 120 / this._neuralSpeed;

        const draw = (timestamp) => {
            ctx.clearRect(0, 0, W, H);

            // Draw connections as faint lines
            ctx.lineWidth = 0.5;
            for (const conn of this._nnConnections) {
                ctx.beginPath();
                ctx.moveTo(conn.from.x * sx, conn.from.y * sy);
                ctx.lineTo(conn.to.x * sx, conn.to.y * sy);
                ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
                ctx.stroke();
            }

            // Draw nodes
            for (const node of this._nnNodes) {
                const nx = node.x * sx;
                const ny = node.y * sy;

                // Outer glow
                ctx.beginPath();
                ctx.arc(nx, ny, 5 * sx, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(nx, ny, 2.5 * sx, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
                ctx.fill();
            }

            // Spawn pulses
            if (this._neuralRunning && timestamp - lastSpawn > spawnInterval()) {
                // Pick a random connection
                const conn = this._nnConnections[
                    Math.floor(Math.random() * this._nnConnections.length)
                ];
                this._nnPulses.push({
                    from: conn.from,
                    to: conn.to,
                    progress: 0,
                    speed: (0.008 + Math.random() * 0.012) * this._neuralSpeed,
                });
                lastSpawn = timestamp;
            }

            // Update and draw pulses
            for (let i = this._nnPulses.length - 1; i >= 0; i--) {
                const pulse = this._nnPulses[i];
                pulse.progress += pulse.speed;

                if (pulse.progress > 1) {
                    this._nnPulses.splice(i, 1);
                    continue;
                }

                const px = (pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress) * sx;
                const py = (pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress) * sy;
                const alpha = Math.sin(pulse.progress * Math.PI);

                // Bright glow
                const grd = ctx.createRadialGradient(px, py, 0, px, py, 8 * sx);
                grd.addColorStop(0, `rgba(74, 222, 128, ${0.9 * alpha})`);
                grd.addColorStop(0.4, `rgba(34, 197, 94, ${0.4 * alpha})`);
                grd.addColorStop(1, `rgba(34, 197, 94, 0)`);
                ctx.beginPath();
                ctx.arc(px, py, 8 * sx, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(px, py, 2 * sx, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 255, 200, ${alpha})`;
                ctx.fill();
            }

            this._animFrameId = requestAnimationFrame(draw);
        };

        this._animFrameId = requestAnimationFrame(draw);
    },

    _stopNeuralAnimation() {
        this._neuralRunning = false;
        // Let pulses drain naturally; the loop keeps running but no new pulses spawn
    },

    // ==========================================================================
    // Text Typing with Character Glow
    // ==========================================================================

    _typeTextWithGlow(element, text) {
        // Clear previous content
        element.innerHTML = '';
        const chars = text.split('');

        chars.forEach((char, i) => {
            const tid = setTimeout(() => {
                const span = document.createElement('span');
                span.className = 's5-char-glow s5-char-flash';
                span.textContent = char;
                element.appendChild(span);

                // Settle the flash after a short delay
                const settleTid = setTimeout(() => {
                    span.classList.remove('s5-char-flash');
                    span.classList.add('s5-char-settled');
                }, 150);
                this._timeouts.push(settleTid);
            }, i * 40);
            this._timeouts.push(tid);
        });
    },

    // ==========================================================================
    // Probability Bars with Glow, Gradient, Elastic, and Dot
    // ==========================================================================

    _showBars(predictions) {
        const container = document.getElementById('s5-bars');
        if (!container) return;
        container.innerHTML = '';

        const maxProb = Math.max(...predictions.map(p => p.prob));

        predictions.forEach((pred, i) => {
            const bar = document.createElement('div');
            bar.className = 's5-bar';
            bar.style.opacity = '0';

            // Gradient from dark green to bright green based on probability
            const ratio = pred.prob / maxProb;
            const darkG = '#0a4a1e';
            const brightG = '#22c55e';

            bar.innerHTML = `
                <span class="s5-bar-label">${pred.word}</span>
                <div class="s5-bar-track">
                    <div class="s5-bar-fill" style="
                        background: linear-gradient(90deg, ${darkG}, ${brightG});
                        width: 0%;
                    ">
                        <div class="s5-bar-dot"></div>
                    </div>
                </div>
                <span class="s5-bar-value">${Math.round(pred.prob * 100)}%</span>
            `;
            container.appendChild(bar);

            // Stagger the appearance
            const tid = setTimeout(() => {
                // Fade in the bar row
                const fadeIn = gsap.to(bar, { opacity: 1, duration: 0.25 });
                this._independentTweens.push(fadeIn);

                const fill = bar.querySelector('.s5-bar-fill');
                const dot = bar.querySelector('.s5-bar-dot');

                // Animate bar fill with elastic ease
                const fillTween = gsap.to(fill, {
                    width: `${pred.prob * 100}%`,
                    duration: 0.9,
                    ease: 'elastic.out(1, 0.6)',
                    delay: 0.05,
                });
                this._independentTweens.push(fillTween);

                // Animate the leading dot
                const dotTween = gsap.to(dot, {
                    opacity: 1,
                    duration: 0.3,
                    delay: 0.1,
                    onComplete: () => {
                        // Fade dot out after bar settles
                        const dotFade = gsap.to(dot, { opacity: 0, duration: 0.6, delay: 0.4 });
                        this._independentTweens.push(dotFade);
                    },
                });
                this._independentTweens.push(dotTween);
            }, i * 100);
            this._timeouts.push(tid);
        });

        // Pulse the top prediction bar (first child)
        const pulseTid = setTimeout(() => {
            const firstBar = container.querySelector('.s5-bar');
            if (firstBar) {
                // Spawn an independent pulsing tween via tl.call pattern
                const pulseTween = gsap.to(firstBar, {
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.35), 0 0 40px rgba(34, 197, 94, 0.15)',
                    duration: 0.6,
                    yoyo: true,
                    repeat: 3,
                    ease: 'sine.inOut',
                });
                this._independentTweens.push(pulseTween);
            }
        }, predictions.length * 100 + 900);
        this._timeouts.push(pulseTid);
    },

    // ==========================================================================
    // Word Flight with Trail Effect and Bezier Arc
    // ==========================================================================

    _flyWordToInput(word, predText) {
        const firstBar = document.querySelector('.s5-bar');
        if (!firstBar) return;

        const label = firstBar.querySelector('.s5-bar-label');
        const inputEl = document.getElementById('s5-input');
        if (!label || !inputEl) return;

        const labelRect = label.getBoundingClientRect();
        const inputRect = inputEl.getBoundingClientRect();

        const startX = labelRect.left + labelRect.width / 2;
        const startY = labelRect.top + labelRect.height / 2;
        const endX = inputRect.right - 40;
        const endY = inputRect.top + inputRect.height / 2;

        // Create the main flying word
        const flyer = document.createElement('span');
        flyer.className = 's5-flying-word';
        flyer.textContent = word;
        flyer.style.left = startX + 'px';
        flyer.style.top = startY + 'px';
        document.body.appendChild(flyer);

        // Create trail ghosts
        const trailCount = 6;
        const trails = [];
        for (let i = 0; i < trailCount; i++) {
            const ghost = document.createElement('span');
            ghost.className = 's5-trail-ghost';
            ghost.textContent = word;
            ghost.style.left = startX + 'px';
            ghost.style.top = startY + 'px';
            ghost.style.opacity = '0';
            document.body.appendChild(ghost);
            trails.push(ghost);
        }

        // Animate the main word along a bezier-like arc
        // We use a proxy to interpolate a custom path: up then curve down
        const proxy = { t: 0 };

        const midX = (startX + endX) / 2;
        const peakY = Math.min(startY, endY) - 60; // arc upward

        const getPos = (t) => {
            // Quadratic bezier: start -> (midX, peakY) -> end
            const invT = 1 - t;
            const x = invT * invT * startX + 2 * invT * t * midX + t * t * endX;
            const y = invT * invT * startY + 2 * invT * t * peakY + t * t * endY;
            return { x, y };
        };

        const flyTween = gsap.to(proxy, {
            t: 1,
            duration: 0.7,
            ease: 'power2.inOut',
            onUpdate: () => {
                const pos = getPos(proxy.t);
                flyer.style.left = pos.x + 'px';
                flyer.style.top = pos.y + 'px';

                // Update trail ghosts with delayed positions
                trails.forEach((ghost, i) => {
                    const trailT = Math.max(0, proxy.t - (i + 1) * 0.06);
                    if (trailT > 0) {
                        const trailPos = getPos(trailT);
                        ghost.style.left = trailPos.x + 'px';
                        ghost.style.top = trailPos.y + 'px';
                        ghost.style.opacity = String(0.4 - i * 0.06);
                    }
                });
            },
            onComplete: () => {
                // Add word to the text input
                const spaceSpan = document.createElement('span');
                spaceSpan.className = 's5-char-glow s5-char-settled';
                spaceSpan.textContent = ' ' + word;
                predText.appendChild(spaceSpan);

                // Landing flash
                const flash = document.createElement('div');
                flash.className = 's5-landing-flash';
                flash.style.left = endX + 'px';
                flash.style.top = endY + 'px';
                document.body.appendChild(flash);

                const flashTween = gsap.fromTo(flash,
                    { scale: 0.3, opacity: 1 },
                    {
                        scale: 2.5,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        onComplete: () => flash.remove(),
                    }
                );
                this._independentTweens.push(flashTween);

                // Clean up flyer and trails
                flyer.remove();
                trails.forEach(g => g.remove());
            },
        });
        this._independentTweens.push(flyTween);
    },

    // ==========================================================================
    // Clear Bars
    // ==========================================================================

    _clearBars() {
        const container = document.getElementById('s5-bars');
        if (!container) return;
        const children = Array.from(container.children);
        if (children.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Use a dedicated timeline for the clear animation
        const clearTl = gsap.timeline({
            onComplete: () => {
                container.innerHTML = '';
            },
        });
        clearTl.to(children, {
            opacity: 0,
            y: -10,
            stagger: 0.03,
            duration: 0.2,
        });
        this._independentTweens.push(clearTl);
    },

    // ==========================================================================
    // Temperature Slider
    // ==========================================================================

    _bindTemperatureSlider() {
        const slider = document.getElementById('s5-temp-range');
        const valueDisplay = document.getElementById('s5-temp-value');
        const labelDisplay = document.getElementById('s5-temp-label');
        const lastRound = PREDICTION_ROUNDS[PREDICTION_ROUNDS.length - 1];

        if (!slider) return;

        const handler = () => {
            const temp = parseFloat(slider.value);
            valueDisplay.textContent = temp.toFixed(1);

            // Update label
            if (temp < 0.1) labelDisplay.textContent = 'Most predictable';
            else if (temp < 0.6) labelDisplay.textContent = 'Reliable, repetitive';
            else if (temp < 1.3) labelDisplay.textContent = 'Balanced';
            else if (temp < 1.7) labelDisplay.textContent = 'More varied, less reliable';
            else labelDisplay.textContent = 'Unpredictable, higher risk';

            // Softmax with temperature: prob_i^(1/T) / sum(prob_j^(1/T))
            const effectiveTemp = Math.max(temp, 0.01);
            const adjusted = lastRound.predictions.map(p => ({
                word: p.word,
                prob: Math.pow(p.prob, 1 / effectiveTemp),
            }));
            const sum = adjusted.reduce((s, p) => s + p.prob, 0);
            adjusted.forEach(p => (p.prob = p.prob / sum));

            // Sort by probability descending
            adjusted.sort((a, b) => b.prob - a.prob);

            this._showBars(adjusted);

            // Adjust neural network speed based on temperature
            this._neuralSpeed = 0.3 + temp * 1.2;
            if (!this._neuralRunning) {
                this._startNeuralAnimation();
            }
        };

        slider.addEventListener('input', handler);
        this._temperatureCleanup = () => {
            slider.removeEventListener('input', handler);
        };

        // Start neural animation at default speed for slider interaction
        this._neuralSpeed = 1;
        this._startNeuralAnimation();
    },

    // ==========================================================================
    // Cleanup
    // ==========================================================================

    cleanup() {
        // Clear all timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill all independent tweens / timelines
        this._independentTweens.forEach(tw => {
            if (tw && typeof tw.kill === 'function') tw.kill();
        });
        this._independentTweens = [];

        // Stop neural canvas animation
        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
            this._animFrameId = null;
        }
        this._neuralRunning = false;
        this._nnPulses = [];

        // Remove temperature listener
        if (this._temperatureCleanup) {
            this._temperatureCleanup();
            this._temperatureCleanup = null;
        }

        // Remove any lingering flyer / trail / flash elements from body
        document.querySelectorAll('.s5-flying-word, .s5-trail-ghost, .s5-landing-flash').forEach(el => el.remove());

        // Kill any GSAP tweens on our elements
        gsap.killTweensOf('.s5-bar');
        gsap.killTweensOf('.s5-bar-fill');
        gsap.killTweensOf('.s5-bar-dot');
        gsap.killTweensOf('#s5-input');
        gsap.killTweensOf('#s5-neural-canvas');
        gsap.killTweensOf('#s5-temp-slider');
        gsap.killTweensOf('#s5-pred-label');
    },
};
