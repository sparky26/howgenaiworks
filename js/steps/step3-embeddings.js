import { EMBEDDING_WORDS, EMBEDDING_CONNECTIONS, NARRATIONS } from '../config.js';

export default {
    _timeouts: [],
    _breatheTweens: [],
    _glowTweens: [],

    build(container) {
        const representativeTokens = [
            { word: 'fox', vector: '[ 0.284, -0.517, 0.093, 0.741, ..., -0.328 ]' },
            { word: 'dog', vector: '[ 0.301, -0.492, 0.107, 0.698, ..., -0.315 ]' },
            { word: 'king', vector: '[ -0.156, 0.832, -0.441, 0.205, ..., 0.617 ]' },
            { word: 'jumps', vector: '[ 0.615, 0.103, -0.782, -0.054, ..., 0.429 ]' },
        ];

        const tokenPillsHTML = representativeTokens.map((t, i) => `
            <div class="s3-transform-row" data-index="${i}" style="
                display: flex;
                align-items: center;
                gap: 20px;
                opacity: 0;
                position: relative;
            ">
                <!-- The token pill (left side) -->
                <div class="s3-pill" data-word="${t.word}" style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-mono);
                    font-size: 15px;
                    padding: 8px 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(0, 212, 255, 0.5);
                    background: rgba(0, 212, 255, 0.08);
                    color: #00d4ff;
                    min-width: 80px;
                    text-align: center;
                    position: relative;
                    white-space: nowrap;
                    box-shadow: 0 0 12px rgba(0, 212, 255, 0.15);
                ">${t.word}</div>

                <!-- Morphing arrow zone -->
                <div class="s3-morph-arrow" style="
                    color: var(--text-secondary);
                    font-size: 22px;
                    opacity: 0;
                    transform: scaleX(0);
                ">&#10230;</div>

                <!-- The vector display (right side, hidden initially) -->
                <div class="s3-vector-display" style="
                    font-family: var(--font-mono);
                    font-size: clamp(9px, 2vw, 12px);
                    color: #a855f7;
                    background: rgba(168, 85, 247, 0.06);
                    border: 1px solid rgba(168, 85, 247, 0.25);
                    border-radius: 10px;
                    padding: 6px 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 50vw;
                    opacity: 0;
                    transform: scaleX(0.3);
                    transform-origin: left center;
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
                    backdrop-filter: blur(4px);
                ">${t.vector}</div>
            </div>
        `).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.innerHTML = `
            <div class="step-subtitle">Step 3</div>
            <h1 class="step-title">Turning Words Into Numbers</h1>
            <div class="step-visual" style="flex-direction: column; gap: 12px;">
                <!-- Phase 1: Token to vector transformation -->
                <div class="s3-token-transform" style="
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-start;
                    width: 100%;
                    max-width: 720px;
                    padding-left: clamp(8px, 3vw, 40px);
                    overflow-x: auto;
                ">
                    ${tokenPillsHTML}
                    <div class="s3-dim-label" style="
                        font-family: var(--font-mono);
                        font-size: 12px;
                        color: var(--text-secondary);
                        opacity: 0;
                        align-self: center;
                        margin-top: 4px;
                    ">Each word becomes a list of 768+ numbers (simplified above)</div>
                </div>

                <!-- Phase 2: Scatter plot constellation -->
                <div class="s3-scatter-container" style="
                    width: 100%;
                    max-width: 560px;
                    opacity: 0;
                    position: relative;
                ">
                    <svg class="scatter-plot" viewBox="0 0 620 400" style="width: 100%; max-height: 280px; overflow: visible;"></svg>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step3}</p>
        `;
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();
        const rows = document.querySelectorAll('.s3-transform-row');

        // ------------------------------------------------------------------
        // Phase 0: Header
        // ------------------------------------------------------------------
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');

        // ------------------------------------------------------------------
        // Phase 1: Token pills appear on the left, then TRANSFORM into vectors
        // ------------------------------------------------------------------
        rows.forEach((row, i) => {
            const pill = row.querySelector('.s3-pill');
            const arrow = row.querySelector('.s3-morph-arrow');
            const vector = row.querySelector('.s3-vector-display');

            // Row fades in
            tl.to(row, {
                opacity: 1,
                duration: 0.35,
                delay: i === 0 ? 0.3 : 0.1,
            });

            // Pill pulses/stretches as transformation begins
            tl.to(pill, {
                scaleX: 1.3,
                filter: 'blur(2px)',
                boxShadow: '0 0 25px rgba(0, 212, 255, 0.4)',
                duration: 0.3,
                ease: 'power2.in',
            });

            // Arrow stretches in
            tl.to(arrow, {
                opacity: 1,
                scaleX: 1,
                duration: 0.25,
                ease: 'back.out(1.5)',
            }, '-=0.1');

            // Pill settles back, loses glow
            tl.to(pill, {
                scaleX: 1,
                filter: 'blur(0px)',
                boxShadow: '0 0 12px rgba(0, 212, 255, 0.15)',
                borderColor: 'rgba(168, 85, 247, 0.4)',
                background: 'rgba(168, 85, 247, 0.08)',
                color: '#c084fc',
                duration: 0.3,
                ease: 'power2.out',
            }, '-=0.05');

            // Vector display scales in from left
            tl.to(vector, {
                opacity: 1,
                scaleX: 1,
                duration: 0.4,
                ease: 'power3.out',
            }, '-=0.2');
        });

        // ------------------------------------------------------------------
        // Phase 2: Dimension label
        // ------------------------------------------------------------------
        tl.to('.s3-dim-label', { opacity: 0.7, duration: 0.4 });

        // ------------------------------------------------------------------
        // Phase 3: Transition from token view to scatter plot
        // ------------------------------------------------------------------
        tl.to('.s3-token-transform', {
            opacity: 0,
            y: -15,
            scale: 0.95,
            duration: 0.6,
            delay: 1.2,
            ease: 'power2.in',
        });

        tl.to('.s3-scatter-container', {
            opacity: 1,
            duration: 0.4,
        });

        // ------------------------------------------------------------------
        // Phase 4: Build the living constellation scatter plot
        // ------------------------------------------------------------------
        tl.call(() => this._buildConstellationPlot());

        // Allow time for D3 staggered animations to play
        tl.to({}, { duration: 3.5 });

        // ------------------------------------------------------------------
        // Phase 5: Spawn breathing animation on all orbs (independent tweens)
        // ------------------------------------------------------------------
        tl.call(() => this._startBreathingAnimation());

        // ------------------------------------------------------------------
        // Phase 6: Narration
        // ------------------------------------------------------------------
        tl.from('.step-narration', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5');

        return tl;
    },

    _buildConstellationPlot() {
        const svg = d3.select('.scatter-plot');
        const width = 620, height = 400;
        const margin = { top: 25, right: 35, bottom: 45, left: 55 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // ---- SVG definitions for glowing orbs ----
        const defs = svg.append('defs');

        const groupColors = {
            animal: { main: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)' },
            royalty: { main: '#ec4899', glow: 'rgba(236, 72, 153, 0.6)' },
            person: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
            action: { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.6)' },
            function: { main: '#888888', glow: 'rgba(136, 136, 136, 0.5)' },
        };

        // Create radial gradient for each group
        Object.entries(groupColors).forEach(([group, colors]) => {
            const grad = defs.append('radialGradient')
                .attr('id', `orb-grad-${group}`)
                .attr('cx', '40%')
                .attr('cy', '40%')
                .attr('r', '60%');
            grad.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', '#ffffff')
                .attr('stop-opacity', 0.9);
            grad.append('stop')
                .attr('offset', '30%')
                .attr('stop-color', colors.main)
                .attr('stop-opacity', 0.85);
            grad.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colors.main)
                .attr('stop-opacity', 0.2);
        });

        // Glow filter
        const glowFilter = defs.append('filter')
            .attr('id', 'orb-glow')
            .attr('x', '-100%').attr('y', '-100%')
            .attr('width', '300%').attr('height', '300%');
        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'blur');
        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'blur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, 1]).range([0, innerW]);
        const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0]);

        // ---- Subtle grid (star chart feel) ----
        const gridG = g.append('g').attr('class', 'grid-lines');
        for (let i = 0; i <= 10; i++) {
            const xPos = (innerW / 10) * i;
            const yPos = (innerH / 10) * i;
            gridG.append('line')
                .attr('x1', xPos).attr('y1', 0)
                .attr('x2', xPos).attr('y2', innerH)
                .attr('stroke', 'rgba(255,255,255,0.03)')
                .attr('stroke-width', 0.5);
            gridG.append('line')
                .attr('x1', 0).attr('y1', yPos)
                .attr('x2', innerW).attr('y2', yPos)
                .attr('stroke', 'rgba(255,255,255,0.03)')
                .attr('stroke-width', 0.5);
        }

        // ---- Axis labels ----
        g.append('text')
            .attr('x', innerW / 2).attr('y', innerH + 36)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8888a0')
            .style('font-size', '11px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Semantic Dimension 1');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2).attr('y', -40)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8888a0')
            .style('font-size', '11px')
            .style('font-family', 'JetBrains Mono, monospace')
            .text('Semantic Dimension 2');

        // ---- Connection lines layer (drawn behind orbs) ----
        const connectionsG = g.append('g').attr('class', 'connections-layer');

        // ---- Orb layer ----
        const orbsG = g.append('g').attr('class', 'orbs-layer');

        // ---- Draw each word as a glowing orb with staggered pop-in ----
        EMBEDDING_WORDS.forEach((w, i) => {
            const colors = groupColors[w.group] || groupColors.function;
            const cx = x(w.x);
            const cy = y(w.y);

            const orbGroup = orbsG.append('g')
                .attr('class', `orb-group orb-${w.word}`)
                .attr('transform', `translate(${cx}, ${cy})`);

            // Outer glow halo
            orbGroup.append('circle')
                .attr('class', 'orb-halo')
                .attr('r', 0)
                .attr('fill', 'none')
                .attr('stroke', colors.main)
                .attr('stroke-width', 1)
                .attr('opacity', 0);

            // Radial gradient orb
            orbGroup.append('circle')
                .attr('class', 'orb-core')
                .attr('r', 0)
                .attr('fill', `url(#orb-grad-${w.group})`)
                .attr('filter', 'url(#orb-glow)')
                .attr('opacity', 0);

            // Label
            orbGroup.append('text')
                .attr('class', 'orb-label')
                .attr('y', -18)
                .attr('text-anchor', 'middle')
                .attr('fill', '#e8e8f0')
                .style('font-size', '12px')
                .style('font-family', 'JetBrains Mono, monospace')
                .style('text-shadow', `0 0 8px ${colors.main}`)
                .attr('opacity', 0)
                .text(w.word);

            // Staggered pop-in animation
            this._timeouts.push(setTimeout(() => {
                // Core orb pops in with elastic ease
                orbGroup.select('.orb-core')
                    .transition().duration(500)
                    .ease(d3.easeElasticOut.amplitude(1).period(0.4))
                    .attr('r', 7)
                    .attr('opacity', 1);

                // Halo expands
                orbGroup.select('.orb-halo')
                    .transition().duration(600).delay(100)
                    .attr('r', 20)
                    .attr('opacity', 0.2);

                // Label fades in
                orbGroup.select('.orb-label')
                    .transition().duration(400).delay(250)
                    .attr('opacity', 1);
            }, i * 180));
        });

        // ---- Connection lines draw themselves after all orbs appear ----
        const allOrbsDelay = EMBEDDING_WORDS.length * 180 + 400;

        EMBEDDING_CONNECTIONS.forEach((conn, i) => {
            const from = EMBEDDING_WORDS.find(w => w.word === conn.from);
            const to = EMBEDDING_WORDS.find(w => w.word === conn.to);
            if (!from || !to) return;

            const x1 = x(from.x), y1 = y(from.y);
            const x2 = x(to.x), y2 = y(to.y);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Connection line with stroke-dashoffset animation
            const line = connectionsG.append('line')
                .attr('x1', x1).attr('y1', y1)
                .attr('x2', x2).attr('y2', y2)
                .attr('stroke', 'rgba(168, 85, 247, 0.5)')
                .attr('stroke-width', 1)
                .attr('stroke-dasharray', '6 3')
                .attr('opacity', 0);

            // Calculate total length for stroke animation
            const totalLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            line.attr('stroke-dasharray', totalLen)
                .attr('stroke-dashoffset', totalLen);

            // Distance label
            const label = connectionsG.append('text')
                .attr('x', midX).attr('y', midY - 8)
                .attr('text-anchor', 'middle')
                .attr('fill', '#c084fc')
                .style('font-size', '10px')
                .style('font-family', 'JetBrains Mono, monospace')
                .style('text-shadow', '0 0 6px rgba(168, 85, 247, 0.5)')
                .attr('opacity', 0)
                .text(`dist: ${conn.label}`);

            this._timeouts.push(setTimeout(() => {
                line.transition().duration(700)
                    .attr('stroke-dashoffset', 0)
                    .attr('opacity', 0.6);

                label.transition().duration(400).delay(500)
                    .attr('opacity', 0.8);
            }, allOrbsDelay + i * 250));
        });
    },

    _startBreathingAnimation() {
        // Spawn independent infinite tweens for each orb (never on the timeline)
        const orbs = document.querySelectorAll('.orb-core');
        const halos = document.querySelectorAll('.orb-halo');

        orbs.forEach((orb, i) => {
            const delay = Math.random() * 2;
            const duration = 2 + Math.random() * 1.5;
            const tw = gsap.to(orb, {
                attr: { r: 9 },
                opacity: 0.75,
                duration: duration,
                delay: delay,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
            this._breatheTweens.push(tw);
        });

        halos.forEach((halo, i) => {
            const delay = Math.random() * 2;
            const duration = 2.5 + Math.random() * 1.5;
            const tw = gsap.to(halo, {
                attr: { r: 25 },
                opacity: 0.08,
                duration: duration,
                delay: delay,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
            this._breatheTweens.push(tw);
        });

        // Add a subtle shimmer to labels
        const labels = document.querySelectorAll('.orb-label');
        labels.forEach((label, i) => {
            const delay = Math.random() * 3;
            const tw = gsap.to(label, {
                opacity: 0.6,
                duration: 2 + Math.random() * 1.5,
                delay: delay,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
            this._glowTweens.push(tw);
        });
    },

    cleanup() {
        // Clear all timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill breathing tweens
        this._breatheTweens.forEach(tw => tw.kill());
        this._breatheTweens = [];

        // Kill glow tweens
        this._glowTweens.forEach(tw => tw.kill());
        this._glowTweens = [];

        // Clear D3 SVG content
        d3.select('.scatter-plot').selectAll('*').remove();

        // Kill any lingering GSAP tweens on our elements
        gsap.killTweensOf('.s3-pill');
        gsap.killTweensOf('.s3-morph-arrow');
        gsap.killTweensOf('.s3-vector-display');
        gsap.killTweensOf('.s3-transform-row');
        gsap.killTweensOf('.s3-token-transform');
        gsap.killTweensOf('.s3-scatter-container');
        gsap.killTweensOf('.orb-core');
        gsap.killTweensOf('.orb-halo');
        gsap.killTweensOf('.orb-label');
    },
};
