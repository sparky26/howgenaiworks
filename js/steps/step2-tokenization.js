import { SAMPLE_TEXT, TOKENS, NARRATIONS } from '../config.js';

export default {
    _timeouts: [],
    _floatTweens: [],
    _particleEls: [],

    build(container) {
        // Build word spans for the original text display (to match step1 feel)
        const rawWords = SAMPLE_TEXT.split(' ');
        const wordSpansHTML = rawWords.map((word, i) =>
            `<span class="s2-word" data-wi="${i}" style="
                display: inline-block;
                position: relative;
                margin: 0 3px;
                transition: color 0.3s;
            ">${word}</span>`
        ).join(' ');

        // Build token pills HTML (hidden initially)
        const tokenHTML = TOKENS.map((t, i) => `
            <span class="s2-token ${t.subword ? 's2-subword' : ''}" data-index="${i}" style="
                display: inline-flex;
                align-items: center;
                font-family: var(--font-mono);
                font-size: 14px;
                padding: 7px 14px;
                border-radius: 8px;
                border: 1px solid transparent;
                background: transparent;
                color: var(--text-accent);
                position: relative;
                white-space: nowrap;
                opacity: 0;
                transform: scale(0.5) translateY(20px);
            ">
                ${t.text}
                <span class="s2-token-id" style="
                    font-size: 9px;
                    font-weight: 600;
                    color: var(--accent-cyan);
                    position: absolute;
                    top: -8px;
                    right: -6px;
                    background: var(--bg-deep);
                    padding: 1px 5px;
                    border-radius: 4px;
                    border: 1px solid transparent;
                    letter-spacing: 0.02em;
                    opacity: 0;
                    transform: scale(0);
                ">${t.id}</span>
            </span>
        `).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.innerHTML = `
            <div class="step-subtitle">Step 2</div>
            <h1 class="step-title">Breaking Text Into Pieces</h1>
            <div class="step-visual" style="flex-direction: column; align-items: center; justify-content: center; overflow: visible;">
                <div class="s2-stage" style="
                    position: relative;
                    max-width: 800px;
                    width: 100%;
                    min-height: 200px;
                    padding: 24px;
                ">
                    <!-- Scanner line -->
                    <div class="s2-scanner" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 2px;
                        height: 100%;
                        background: linear-gradient(180deg,
                            transparent 0%,
                            rgba(0, 212, 255, 0.15) 15%,
                            rgba(0, 212, 255, 1) 50%,
                            rgba(0, 212, 255, 0.15) 85%,
                            transparent 100%);
                        box-shadow: 0 0 20px 4px rgba(0, 212, 255, 0.5),
                                    0 0 50px 8px rgba(0, 212, 255, 0.15);
                        opacity: 0;
                        pointer-events: none;
                        z-index: 5;
                    "></div>

                    <!-- Particle burst container -->
                    <div class="s2-particles" style="
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        z-index: 4;
                        overflow: visible;
                    "></div>

                    <!-- Phase 1: original text as words -->
                    <div class="s2-original-text" style="
                        font-family: var(--font-body);
                        font-size: clamp(14px, 3.5vw, 20px);
                        line-height: 2.0;
                        color: var(--text-accent);
                        text-align: center;
                        width: 100%;
                        position: relative;
                        z-index: 2;
                    ">${wordSpansHTML}</div>

                    <!-- Phase 2: token pills grid -->
                    <div class="s2-token-grid" style="
                        display: none;
                        flex-wrap: wrap;
                        gap: 10px;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                        position: relative;
                        z-index: 2;
                    ">${tokenHTML}</div>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step2}</p>
        `;
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();
        const origWords = document.querySelectorAll('.s2-word');
        const scanner = document.querySelector('.s2-scanner');
        const origText = document.querySelector('.s2-original-text');
        const tokenGrid = document.querySelector('.s2-token-grid');
        const tokens = document.querySelectorAll('.s2-token');
        const particleContainer = document.querySelector('.s2-particles');
        const stage = document.querySelector('.s2-stage');

        // ------------------------------------------------------------------
        // Phase 0: Fade in header and show text
        // ------------------------------------------------------------------
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');
        tl.from(origText, { opacity: 0, duration: 0.5 }, '-=0.1');

        // Brief pause to let viewer read the text
        tl.to({}, { duration: 0.6 });

        // ------------------------------------------------------------------
        // Phase 1: Cyan scanner sweeps left to right with sparks at word gaps
        // ------------------------------------------------------------------
        tl.set(scanner, { opacity: 1, left: '0%' });

        // Sweep the scanner across
        tl.to(scanner, {
            left: '100%',
            duration: 2.0,
            ease: 'power1.inOut',
        });

        // As the scanner passes, highlight each word with a brief flash
        tl.call(() => {
            const stageRect = stage.getBoundingClientRect();
            origWords.forEach((word, i) => {
                const wordRect = word.getBoundingClientRect();
                // Calculate when the scanner reaches this word boundary
                // as a fraction of the stage width
                const wordEnd = (wordRect.right - stageRect.left) / stageRect.width;
                const delayMs = wordEnd * 2000; // 2s sweep duration

                const tid = setTimeout(() => {
                    // Flash/spark at word boundary
                    const spark = document.createElement('div');
                    spark.style.cssText = `
                        position: absolute;
                        top: ${wordRect.top - stageRect.top + wordRect.height / 2}px;
                        left: ${wordRect.right - stageRect.left}px;
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #00d4ff;
                        box-shadow: 0 0 12px 4px rgba(0, 212, 255, 0.8),
                                    0 0 30px 8px rgba(0, 212, 255, 0.3);
                        pointer-events: none;
                        z-index: 6;
                        transform: translate(-50%, -50%);
                    `;
                    particleContainer.appendChild(spark);
                    this._particleEls.push(spark);

                    gsap.to(spark, {
                        scale: 3,
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        onComplete: () => {
                            if (spark.parentNode) spark.parentNode.removeChild(spark);
                        },
                    });

                    // Brief color flash on the word
                    gsap.to(word, {
                        color: '#00d4ff',
                        textShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
                        duration: 0.15,
                        yoyo: true,
                        repeat: 1,
                    });
                }, delayMs);
                this._timeouts.push(tid);
            });
        }, null, '<'); // fire at start of scanner sweep

        // Fade out the scanner
        tl.to(scanner, {
            opacity: 0,
            duration: 0.3,
        });

        // ------------------------------------------------------------------
        // Phase 2: Text SHATTERS -- words separate with elastic bounce
        // ------------------------------------------------------------------
        tl.to({}, { duration: 0.3 }); // brief pause

        // Add gaps between words with elastic bounce
        tl.to(origWords, {
            marginLeft: 10,
            marginRight: 10,
            duration: 0.7,
            ease: 'elastic.out(1, 0.4)',
            stagger: {
                each: 0.03,
                from: 'center',
            },
        });

        // ------------------------------------------------------------------
        // Phase 2b: Particle burst at the moment of shatter
        // ------------------------------------------------------------------
        tl.call(() => {
            const stageRect = stage.getBoundingClientRect();
            const centerX = stageRect.width / 2;
            const centerY = stageRect.height / 2;
            const particleCount = 25;

            for (let p = 0; p < particleCount; p++) {
                const particle = document.createElement('div');
                const size = 2 + Math.random() * 4;
                const hue = 180 + Math.random() * 30; // cyan range
                particle.style.cssText = `
                    position: absolute;
                    left: ${centerX}px;
                    top: ${centerY}px;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: hsl(${hue}, 100%, 70%);
                    box-shadow: 0 0 ${size * 2}px hsl(${hue}, 100%, 60%);
                    pointer-events: none;
                    z-index: 10;
                `;
                particleContainer.appendChild(particle);
                this._particleEls.push(particle);

                // Random explosion direction
                const angle = Math.random() * Math.PI * 2;
                const velocity = 60 + Math.random() * 140;
                const destX = Math.cos(angle) * velocity;
                const destY = Math.sin(angle) * velocity - 30; // bias upward slightly
                const gravity = 80 + Math.random() * 60; // simulated gravity offset

                gsap.to(particle, {
                    x: destX,
                    y: destY + gravity, // gravity pulls down
                    opacity: 0,
                    scale: 0,
                    duration: 0.8 + Math.random() * 0.6,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (particle.parentNode) particle.parentNode.removeChild(particle);
                    },
                });
            }
        }, null, '-=0.6'); // trigger during the shatter

        // ------------------------------------------------------------------
        // Phase 3: Some words crack into subwords
        //          We show a bright splitting line, then pieces slide apart
        // ------------------------------------------------------------------
        tl.to({}, { duration: 0.5 }); // pause after shatter

        // Build a map of which original words contain subword tokens
        // "morning" -> ["morn", "ing"], "meadow" -> ["mead", "ow"], "chasing" -> ["chas", "ing"]
        const subwordMap = [
            { origWordIndex: 11, subwords: ['morn', 'ing'] },   // "morning,"  -- word index in rawWords
            { origWordIndex: 19, subwords: ['mead', 'ow'] },    // "meadow,"
            { origWordIndex: 21, subwords: ['chas', 'ing'] },   // "chasing"
        ];

        // Find the correct word indices by matching text
        const rawWords = SAMPLE_TEXT.split(' ');

        subwordMap.forEach((entry, i) => {
            // Find the word that starts with the concatenation of the subwords
            const combined = entry.subwords.join('');
            let targetIdx = -1;
            for (let w = 0; w < rawWords.length; w++) {
                // Strip trailing punctuation for matching
                const cleaned = rawWords[w].replace(/[.,!?;:]/g, '');
                if (cleaned === combined) {
                    targetIdx = w;
                    break;
                }
            }
            if (targetIdx < 0) return;

            const wordEl = origWords[targetIdx];
            if (!wordEl) return;

            // At this point in the timeline, show a bright split line
            // Then replace the word content with two colored halves
            tl.call(() => {
                const text = wordEl.textContent;
                const sub1 = entry.subwords[0];
                // Find where the split occurs in the original word text
                const splitPos = text.indexOf(sub1) + sub1.length;
                const part1 = text.slice(0, splitPos);
                const part2 = text.slice(splitPos);

                wordEl.innerHTML = `
                    <span class="s2-sub-left" style="
                        display: inline-block;
                        color: #00d4ff;
                        text-shadow: 0 0 6px rgba(0, 212, 255, 0.4);
                    ">${part1}</span><span class="s2-split-line" style="
                        display: inline-block;
                        width: 2px;
                        height: 1.2em;
                        background: #fff;
                        box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8),
                                    0 0 20px 4px rgba(0, 255, 170, 0.5);
                        vertical-align: text-bottom;
                        margin: 0 1px;
                        opacity: 0;
                    "></span><span class="s2-sub-right" style="
                        display: inline-block;
                        color: #00ffaa;
                        text-shadow: 0 0 6px rgba(0, 255, 170, 0.4);
                    ">${part2}</span>
                `;

                // Flash the split line
                const splitLine = wordEl.querySelector('.s2-split-line');
                gsap.to(splitLine, {
                    opacity: 1,
                    duration: 0.15,
                    ease: 'power2.out',
                });
                gsap.to(splitLine, {
                    opacity: 0,
                    duration: 0.3,
                    delay: 0.3,
                    ease: 'power2.in',
                });

                // Slide pieces apart
                const leftPart = wordEl.querySelector('.s2-sub-left');
                const rightPart = wordEl.querySelector('.s2-sub-right');
                gsap.to(leftPart, {
                    x: -3,
                    duration: 0.4,
                    delay: 0.15,
                    ease: 'back.out(1.5)',
                });
                gsap.to(rightPart, {
                    x: 3,
                    duration: 0.4,
                    delay: 0.15,
                    ease: 'back.out(1.5)',
                });
            });

            // Stagger the splitting of each subword group
            if (i < subwordMap.length - 1) {
                tl.to({}, { duration: 0.35 });
            }
        });

        // ------------------------------------------------------------------
        // Phase 4: Transition to token grid
        //          Original text fades/scales, token grid appears
        // ------------------------------------------------------------------
        tl.to({}, { duration: 0.8 }); // pause to let user observe

        tl.to(origText, {
            opacity: 0,
            scale: 0.92,
            filter: 'blur(6px)',
            duration: 0.6,
            ease: 'power2.in',
            onComplete: () => {
                origText.style.display = 'none';
                tokenGrid.style.display = 'flex';
            },
        });

        // ------------------------------------------------------------------
        // Phase 5: Tokens float in and rearrange into grid with pill styling
        // ------------------------------------------------------------------
        tl.call(() => {
            tokens.forEach((token, i) => {
                const isSubword = token.classList.contains('s2-subword');
                const borderColor = isSubword
                    ? 'rgba(0, 255, 170, 0.5)'
                    : 'rgba(0, 212, 255, 0.4)';
                const bgColor = isSubword
                    ? 'rgba(0, 255, 170, 0.06)'
                    : 'rgba(0, 212, 255, 0.06)';

                gsap.to(token, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    delay: i * 0.04,
                    ease: 'back.out(1.7)',
                    onStart: () => {
                        token.style.borderColor = borderColor;
                        token.style.background = bgColor;
                        token.style.backdropFilter = 'blur(4px)';
                    },
                });
            });
        });

        // Wait for all tokens to appear
        tl.to({}, { duration: TOKENS.length * 0.04 + 0.6 });

        // ------------------------------------------------------------------
        // Phase 5b: Highlight subword tokens with pulse
        // ------------------------------------------------------------------
        tl.call(() => {
            document.querySelectorAll('.s2-token.s2-subword').forEach(t => {
                gsap.to(t, {
                    boxShadow: '0 0 16px rgba(0, 255, 170, 0.4)',
                    duration: 0.4,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power2.inOut',
                });
            });
        });

        tl.to({}, { duration: 1.0 });

        // ------------------------------------------------------------------
        // Phase 6: Token IDs appear with staggered pop-in
        // ------------------------------------------------------------------
        tl.call(() => {
            const tokenIds = document.querySelectorAll('.s2-token-id');
            tokenIds.forEach((idEl, i) => {
                const isSubword = idEl.closest('.s2-subword');
                const idBorderColor = isSubword
                    ? 'rgba(0, 255, 170, 0.3)'
                    : 'rgba(0, 212, 255, 0.3)';
                const idTextColor = isSubword
                    ? '#00ffaa'
                    : '#00d4ff';

                gsap.to(idEl, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.25,
                    delay: i * 0.025,
                    ease: 'back.out(2)',
                    onStart: () => {
                        idEl.style.borderColor = idBorderColor;
                        idEl.style.color = idTextColor;
                    },
                });
            });
        });

        tl.to({}, { duration: TOKENS.length * 0.025 + 0.4 });

        // ------------------------------------------------------------------
        // Phase 7: Subtle float on tokens (independent tweens via tl.call)
        // ------------------------------------------------------------------
        tl.call(() => {
            tokens.forEach((token) => {
                const delay = Math.random() * 2;
                const yDrift = 1 + Math.random() * 3;
                const duration = 2.5 + Math.random() * 1.5;
                const tw = gsap.to(token, {
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

        // ------------------------------------------------------------------
        // Phase 8: Narration
        // ------------------------------------------------------------------
        tl.from('.step-narration', {
            opacity: 0,
            y: 20,
            duration: 0.6,
        });

        return tl;
    },

    cleanup() {
        // Kill all independent float tweens
        this._floatTweens.forEach(tw => tw.kill());
        this._floatTweens = [];

        // Clear timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Remove lingering particle elements
        this._particleEls.forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        this._particleEls = [];

        // Kill GSAP tweens on our elements
        gsap.killTweensOf('.s2-word');
        gsap.killTweensOf('.s2-token');
        gsap.killTweensOf('.s2-token.s2-subword');
        gsap.killTweensOf('.s2-token-id');
        gsap.killTweensOf('.s2-scanner');
        gsap.killTweensOf('.s2-sub-left');
        gsap.killTweensOf('.s2-sub-right');
        gsap.killTweensOf('.s2-split-line');
    },
};
