import { SAMPLE_TEXT, NARRATIONS } from '../config.js';

export default {
    _timeouts: [],
    _floatTweens: [],
    _glowTween: null,

    build(container) {
        // Split text into words, then each word into character spans
        const words = SAMPLE_TEXT.split(' ');
        let charIndex = 0;
        const wordSpans = words.map((word, wi) => {
            const charSpans = word.split('').map((ch) => {
                const span = `<span class="s1-char" data-ci="${charIndex}" style="
                    display: inline-block;
                    opacity: 0;
                    transform: scale(0);
                    filter: blur(8px);
                ">${ch}</span>`;
                charIndex++;
                return span;
            }).join('');
            // Wrap each word for independent floating later
            const space = wi < words.length - 1
                ? `<span class="s1-char" data-ci="${charIndex}" style="display:inline-block;opacity:0;transform:scale(0);filter:blur(8px);">&nbsp;</span>`
                : '';
            if (wi < words.length - 1) charIndex++;
            return `<span class="s1-word" data-wi="${wi}" style="display:inline-block;">${charSpans}${space}</span>`;
        }).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.innerHTML = `
            <div class="step-subtitle">Step 1</div>
            <h1 class="step-title">It Starts With Text</h1>
            <div class="step-visual" style="flex-direction: column; align-items: center; justify-content: center;">
                <div class="s1-text-display" style="
                    font-family: var(--font-body);
                    font-size: clamp(14px, 3.5vw, 19px);
                    line-height: 1.7;
                    color: var(--text-accent);
                    max-width: 100%;
                    text-align: center;
                    position: relative;
                    padding: 20px;
                ">
                    <!-- Radial glow behind text -->
                    <div class="s1-glow" style="
                        position: absolute;
                        inset: -40px;
                        border-radius: 50%;
                        background: radial-gradient(ellipse at center,
                            rgba(74, 158, 255, 0.12) 0%,
                            rgba(74, 158, 255, 0.04) 40%,
                            transparent 70%);
                        opacity: 0;
                        pointer-events: none;
                    "></div>
                    <!-- Origin particle / dot -->
                    <div class="s1-origin-dot" style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #4a9eff;
                        box-shadow: 0 0 20px 6px rgba(74, 158, 255, 0.8),
                                    0 0 60px 12px rgba(74, 158, 255, 0.3);
                        transform: translate(-50%, -50%);
                        opacity: 0;
                        pointer-events: none;
                        z-index: 3;
                    "></div>
                    <!-- Scanning beam -->
                    <div class="s1-beam" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 3px;
                        height: 100%;
                        background: linear-gradient(180deg,
                            transparent 0%,
                            rgba(74, 158, 255, 0.1) 20%,
                            rgba(74, 158, 255, 0.9) 50%,
                            rgba(74, 158, 255, 0.1) 80%,
                            transparent 100%);
                        box-shadow: 0 0 15px 4px rgba(74, 158, 255, 0.4),
                                    0 0 40px 8px rgba(74, 158, 255, 0.15);
                        opacity: 0;
                        pointer-events: none;
                        z-index: 2;
                    "></div>
                    <!-- The text itself -->
                    <span class="s1-text-content" style="position: relative; z-index: 1;">
                        ${wordSpans}
                    </span>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step1}</p>
        `;
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();
        const chars = document.querySelectorAll('.s1-char');
        const words = document.querySelectorAll('.s1-word');
        const dot = document.querySelector('.s1-origin-dot');
        const beam = document.querySelector('.s1-beam');
        const glow = document.querySelector('.s1-glow');

        // ------------------------------------------------------------------
        // Phase 0: Fade in header
        // ------------------------------------------------------------------
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');

        // ------------------------------------------------------------------
        // Phase 1: A single glowing particle fades in at center
        // ------------------------------------------------------------------
        tl.to(dot, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
        }, '+=0.3');

        // Pulse the dot a couple of times
        tl.to(dot, {
            scale: 1.8,
            boxShadow: '0 0 30px 10px rgba(74, 158, 255, 1), 0 0 80px 20px rgba(74, 158, 255, 0.5)',
            duration: 0.4,
            ease: 'power2.out',
        });
        tl.to(dot, {
            scale: 1,
            boxShadow: '0 0 20px 6px rgba(74, 158, 255, 0.8), 0 0 60px 12px rgba(74, 158, 255, 0.3)',
            duration: 0.3,
            ease: 'power2.in',
        });

        // ------------------------------------------------------------------
        // Phase 2: Dot expands into a horizontal scanning beam
        // ------------------------------------------------------------------
        tl.to(dot, {
            width: '100%',
            height: '3px',
            borderRadius: '0',
            left: '0',
            transform: 'translate(0, -50%)',
            opacity: 0,
            duration: 0.5,
            ease: 'power3.in',
        });

        // Show beam at the left edge
        tl.set(beam, { opacity: 1, left: '0%' }, '-=0.15');

        // ------------------------------------------------------------------
        // Phase 3: Beam sweeps right, characters materialize behind it
        // ------------------------------------------------------------------
        // Sweep beam from left to right
        tl.to(beam, {
            left: '100%',
            duration: 2.0,
            ease: 'power1.inOut',
        });

        // Characters appear in a staggered fashion timed with the beam
        tl.fromTo(chars,
            {
                opacity: 0,
                scale: 0,
                filter: 'blur(8px)',
            },
            {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: 0.4,
                ease: 'back.out(1.4)',
                stagger: {
                    each: 2.0 / chars.length, // spread across the beam duration
                    from: 'start',
                },
            },
            '<' // start at same time as the beam sweep
        );

        // Fade out the beam after sweep
        tl.to(beam, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
        });

        // ------------------------------------------------------------------
        // Phase 4: Radial glow pulses in behind the text
        // ------------------------------------------------------------------
        tl.to(glow, {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.3');

        // ------------------------------------------------------------------
        // Phase 5: Each WORD gets independent subtle floating
        //          Uses tl.call() to spawn independent tweens
        // ------------------------------------------------------------------
        tl.call(() => {
            words.forEach((word, i) => {
                const delay = Math.random() * 1.5;
                const yDrift = 2 + Math.random() * 4;
                const duration = 2 + Math.random() * 1.5;
                const tw = gsap.to(word, {
                    y: -yDrift,
                    duration: duration,
                    delay: delay,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                });
                this._floatTweens.push(tw);
            });
        });

        // Start infinite glow pulse OUTSIDE the timeline via tl.call()
        tl.call(() => {
            this._glowTween = gsap.to(glow, {
                opacity: 0.4,
                duration: 1.5,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
        });

        // ------------------------------------------------------------------
        // Phase 6: Narration fades in
        // ------------------------------------------------------------------
        tl.from('.step-narration', {
            opacity: 0,
            y: 20,
            duration: 0.6,
        }, '-=0.3');

        return tl;
    },

    cleanup() {
        // Kill all independent float tweens
        this._floatTweens.forEach(tw => tw.kill());
        this._floatTweens = [];

        // Kill glow tween
        if (this._glowTween) {
            this._glowTween.kill();
            this._glowTween = null;
        }

        // Clear any timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill any remaining tweens on our elements
        gsap.killTweensOf('.s1-char');
        gsap.killTweensOf('.s1-word');
        gsap.killTweensOf('.s1-glow');
        gsap.killTweensOf('.s1-beam');
        gsap.killTweensOf('.s1-origin-dot');
    },
};
