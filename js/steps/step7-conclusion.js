import { NARRATIONS } from '../config.js';

export default {
    _timeouts: [],
    _independentTweens: [],
    _floatTweens: [],
    _pulseTween: null,

    build(container) {
        const style = document.createElement('style');
        style.textContent = `
            /* ---- Background breathing gradient ---- */
            @keyframes s7-breathe {
                0%   { background-position: 0% 50%; opacity: 0.3; }
                25%  { background-position: 50% 80%; opacity: 0.45; }
                50%  { background-position: 100% 50%; opacity: 0.35; }
                75%  { background-position: 50% 20%; opacity: 0.4; }
                100% { background-position: 0% 50%; opacity: 0.3; }
            }

            .s7-bg-breath {
                position: absolute;
                inset: -60px;
                border-radius: 50%;
                background: radial-gradient(
                    ellipse at center,
                    rgba(251, 191, 36, 0.08) 0%,
                    rgba(251, 191, 36, 0.03) 30%,
                    transparent 65%
                );
                background-size: 200% 200%;
                animation: s7-breathe 12s ease-in-out infinite;
                pointer-events: none;
                z-index: 0;
            }

            /* ---- Headline ---- */
            .s7-headline-wrap {
                position: relative;
                text-align: center;
                max-width: 720px;
                z-index: 1;
            }

            .s7-headline {
                font-family: var(--font-heading);
                font-size: 34px;
                font-weight: 700;
                line-height: 1.35;
                color: var(--text-accent);
                letter-spacing: -0.02em;
                position: relative;
                z-index: 2;
            }

            .s7-word {
                display: inline-block;
                opacity: 0;
                transform: translateY(18px);
                margin-right: 0.28em;
            }

            .s7-word-gold {
                color: #fbbf24;
            }

            .s7-headline-glow {
                position: absolute;
                inset: -30px -50px;
                border-radius: 30px;
                background: radial-gradient(
                    ellipse at center,
                    rgba(251, 191, 36, 0.12) 0%,
                    rgba(251, 191, 36, 0.04) 50%,
                    transparent 80%
                );
                opacity: 0;
                pointer-events: none;
                z-index: 1;
                filter: blur(10px);
            }

            /* ---- Takeaway cards ---- */
            .s7-cards {
                display: flex;
                flex-wrap: wrap;
                gap: 14px;
                justify-content: center;
                align-items: stretch;
                z-index: 1;
            }

            .s7-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 14px;
                padding: 18px 20px;
                max-width: 260px;
                width: 100%;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                opacity: 0;
                transform: translateY(30px);
            }

            .s7-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                border-radius: 16px 16px 0 0;
            }

            .s7-card:nth-child(1)::before {
                background: linear-gradient(90deg, #ef4444, #f97316);
            }
            .s7-card:nth-child(2)::before {
                background: linear-gradient(90deg, #a855f7, #6366f1);
            }
            .s7-card:nth-child(3)::before {
                background: linear-gradient(90deg, #22c55e, #14b8a6);
            }

            .s7-card:hover {
                border-color: rgba(255, 255, 255, 0.12);
                transform: translateY(-4px) !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }

            .s7-card-icon {
                font-size: 24px;
                margin-bottom: 8px;
                display: block;
            }

            .s7-card h3 {
                font-family: var(--font-heading);
                font-size: 17px;
                font-weight: 600;
                color: var(--text-accent);
                margin-bottom: 6px;
            }

            .s7-card p {
                font-size: 14px;
                line-height: 1.55;
                color: var(--text-secondary);
            }

            /* ---- Replay button ---- */
            .s7-replay {
                font-family: var(--font-heading);
                font-size: 16px;
                font-weight: 600;
                color: var(--accent-gold);
                background: color-mix(in srgb, var(--accent-gold) 8%, transparent);
                border: 1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent);
                padding: 14px 36px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(4px);
                opacity: 0;
                z-index: 1;
                position: relative;
            }

            .s7-replay:hover {
                background: color-mix(in srgb, var(--accent-gold) 15%, transparent);
                box-shadow: 0 0 30px rgba(251, 191, 36, 0.2),
                            0 0 60px rgba(251, 191, 36, 0.1);
                transform: translateY(-2px);
            }

            @keyframes s7-pulse-btn {
                0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
                50% { box-shadow: 0 0 20px 4px rgba(251, 191, 36, 0.15); }
            }

            .s7-replay-pulse {
                animation: s7-pulse-btn 2.5s ease-in-out infinite;
            }

            @media (max-width: 600px) {
                .s7-headline {
                    font-size: 24px;
                }
                .s7-card {
                    max-width: 100%;
                    padding: 20px;
                }
            }
        `;

        // Build the word-by-word headline
        // "It doesn't understand. It predicts what comes next."
        // Highlight "doesn't understand" and "predicts" in gold
        const headlineWords = [
            { text: 'It', gold: false },
            { text: "doesn't", gold: true },
            { text: 'understand.', gold: true },
            { text: 'It', gold: false },
            { text: 'predicts', gold: true },
            { text: 'what', gold: false },
            { text: 'comes', gold: false },
            { text: 'next.', gold: false },
        ];

        const wordSpans = headlineWords.map((w, i) => {
            const cls = w.gold ? 's7-word s7-word-gold' : 's7-word';
            return `<span class="${cls}" data-wi="${i}">${w.text}</span>`;
        }).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.style.position = 'relative';
        wrapper.innerHTML = `
            <div class="s7-bg-breath"></div>
            <div class="step-subtitle">Step 7</div>
            <div class="s7-headline-wrap">
                <div class="s7-headline-glow" id="s7-glow"></div>
                <h1 class="s7-headline">${wordSpans}</h1>
            </div>
            <div class="step-visual s7-cards" style="min-height: auto;">
                <div class="s7-card">
                    <span class="s7-card-icon">&#9888;&#65039;</span>
                    <h3>It Can Be Confidently Wrong</h3>
                    <p>AI generates plausible-sounding text even when the content is factually incorrect. This is called "hallucination." AI outputs require human verification — they should never be treated as a source of truth.</p>
                </div>
                <div class="s7-card">
                    <span class="s7-card-icon">&#127922;</span>
                    <h3>Same Input, Different Output</h3>
                    <p>Every response is randomly sampled from probabilities. Ask the same question twice and you may get different answers. This means AI outputs are inherently inconsistent — a key consideration for any process that requires repeatability.</p>
                </div>
                <div class="s7-card">
                    <span class="s7-card-icon">&#128202;</span>
                    <h3>Only As Good As Its Training Data</h3>
                    <p>The model's knowledge comes entirely from its training data, which may contain biases, errors, or gaps. It has no access to your organization's internal data unless explicitly given. It cannot reason about what it hasn't seen.</p>
                </div>
            </div>
            <button class="s7-replay" id="s7-replay" onclick="window.dispatchEvent(new CustomEvent('replay'))">
                &#8635; Replay from Start
            </button>
            <p class="step-narration">${NARRATIONS.step7}</p>
        `;

        wrapper.prepend(style);
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();
        const words = document.querySelectorAll('.s7-word');
        const cards = document.querySelectorAll('.s7-card');
        const glow = document.getElementById('s7-glow');
        const replayBtn = document.getElementById('s7-replay');

        // ---- Subtitle ----
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });

        // ---- Word-by-word dramatic headline reveal ----
        tl.to({}, { duration: 0.3 }); // brief pause

        words.forEach((word, i) => {
            tl.to(word, {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: 'power3.out',
            }, `-=0.20`);
            // Slight pause between words
            if (i < words.length - 1) {
                tl.to({}, { duration: 0.15 });
            }
        });

        // ---- Glow bloom behind headline ----
        tl.to(glow, {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
        }, '-=0.3');

        // Spawn independent subtle glow pulse via tl.call()
        tl.call(() => {
            const glowPulse = gsap.to(glow, {
                opacity: 0.5,
                duration: 2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
            this._independentTweens.push(glowPulse);
        });

        // ---- Takeaway cards slide in from below ----
        tl.to({}, { duration: 0.4 }); // pause before cards

        cards.forEach((card, i) => {
            tl.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
            }, i === 0 ? '+=0.1' : '-=0.35');
        });

        // ---- Spawn independent floating animations for each card ----
        tl.call(() => {
            cards.forEach((card, i) => {
                const yDrift = 4 + Math.random() * 4;
                const duration = 2.8 + i * 0.7;
                const delay = i * 0.4;

                const floatTween = gsap.to(card, {
                    y: -yDrift,
                    duration: duration,
                    delay: delay,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                });
                this._floatTweens.push(floatTween);
            });
        });

        // ---- Replay button ----
        tl.to(replayBtn, {
            opacity: 1,
            duration: 0.5,
            delay: 0.3,
        });

        // Spawn independent pulse on replay button
        tl.call(() => {
            replayBtn.classList.add('s7-replay-pulse');
        });

        // ---- Narration ----
        tl.from('.step-narration', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });

        return tl;
    },

    cleanup() {
        // Clear all timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill independent tweens (glow pulse, etc.)
        this._independentTweens.forEach(tw => {
            if (tw && typeof tw.kill === 'function') tw.kill();
        });
        this._independentTweens = [];

        // Kill float tweens
        this._floatTweens.forEach(tw => {
            if (tw && typeof tw.kill === 'function') tw.kill();
        });
        this._floatTweens = [];

        // Kill pulse tween
        if (this._pulseTween) {
            this._pulseTween.kill();
            this._pulseTween = null;
        }

        // Remove pulse class from button
        const btn = document.getElementById('s7-replay');
        if (btn) btn.classList.remove('s7-replay-pulse');

        // Kill GSAP tweens on our elements
        gsap.killTweensOf('.s7-word');
        gsap.killTweensOf('.s7-card');
        gsap.killTweensOf('#s7-glow');
        gsap.killTweensOf('#s7-replay');
        gsap.killTweensOf('.s7-headline');
    },
};
