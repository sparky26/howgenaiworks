import { NARRATIONS } from '../config.js';

export default {
    _timeouts: [],
    _particleTweens: [],
    _floatTweens: [],

    build(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'step-container';
        wrapper.innerHTML = `
            <div class="step-subtitle">Step 4</div>
            <h1 class="step-title">Finding Patterns in Language</h1>
            <div class="step-visual" style="flex-direction: column; gap: 16px;">
                <!-- Phase 1: 2D vector space with vector arithmetic -->
                <div class="s4-vector-space" style="
                    width: 100%;
                    max-width: 560px;
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;
                ">
                    <svg class="s4-space-svg" viewBox="0 0 520 380" style="width: 100%; height: auto; max-height: 240px; overflow: hidden;"></svg>
                    <!-- Typed formula below the SVG -->
                    <div class="s4-formula" style="
                        text-align: center;
                        margin-top: 8px;
                        font-family: var(--font-heading);
                        font-size: clamp(16px, 4vw, 26px);
                        font-weight: 600;
                        min-height: 28px;
                    ">
                        <span class="s4-f-king" style="color: #ec4899; opacity: 0;">King</span>
                        <span class="s4-f-minus" style="color: var(--text-secondary); opacity: 0;"> &minus; </span>
                        <span class="s4-f-man" style="color: #a855f7; opacity: 0;">Man</span>
                        <span class="s4-f-plus" style="color: var(--text-secondary); opacity: 0;"> + </span>
                        <span class="s4-f-woman" style="color: #a855f7; opacity: 0;">Woman</span>
                        <span class="s4-f-equals" style="color: #fbbf24; opacity: 0;"> = </span>
                        <span class="s4-f-queen" style="color: #ec4899; opacity: 0;">Queen</span>
                    </div>
                </div>

                <!-- Phase 2: Attention visualization -->
                <div class="s4-attention-section" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    max-width: 720px;
                    opacity: 0;
                    overflow: hidden;
                ">
                    <div class="s4-attention-label" style="
                        font-family: var(--font-heading);
                        font-size: clamp(14px, 3.5vw, 18px);
                        color: var(--text-accent);
                        font-weight: 600;
                    ">Which words matter to each other?</div>
                    <svg class="attention-svg" viewBox="0 0 700 200" style="width: 100%; height: auto; max-height: 140px; overflow: hidden;"></svg>

                    <!-- Layer diagram -->
                    <div class="s4-layer-diagram" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                        margin-top: 14px;
                        opacity: 0;
                        transform: translateY(30px);
                    ">
                        <div class="layer-block" style="border-color: rgba(236, 72, 153, 0.3);">Layer 1: Which words go together</div>
                        <div class="layer-arrow">&#8595;</div>
                        <div class="layer-block" style="border-color: rgba(236, 72, 153, 0.5);">Layer 2: Sentence structure</div>
                        <div class="layer-arrow">&#8595;</div>
                        <div class="layer-block" style="border-color: rgba(236, 72, 153, 0.8);">Layer 3+: Broader meaning &amp; context</div>
                        <div style="
                            font-family: var(--font-mono);
                            font-size: 12px;
                            color: var(--text-secondary);
                            margin-top: 4px;
                        ">Stacking layers lets the model find increasingly complex patterns</div>
                    </div>
                </div>
            </div>
            <p class="step-narration">${NARRATIONS.step4}</p>
        `;
        container.appendChild(wrapper);
    },

    enter() {
        const tl = gsap.timeline();

        // ------------------------------------------------------------------
        // Phase 0: Header
        // ------------------------------------------------------------------
        tl.from('.step-subtitle', { opacity: 0, y: 20, duration: 0.4 });
        tl.from('.step-title', { opacity: 0, y: 20, duration: 0.4 }, '-=0.2');

        // ------------------------------------------------------------------
        // Phase 1: Build the 2D vector space with grid and orbs
        // ------------------------------------------------------------------
        tl.call(() => this._buildVectorSpace());
        tl.to({}, { duration: 0.8 }); // wait for orbs to appear

        // ------------------------------------------------------------------
        // Phase 2: Vector arithmetic animation sequence
        // ------------------------------------------------------------------
        tl.call(() => this._animateVectorArithmetic());
        tl.to({}, { duration: 6.5 }); // time for the full arithmetic sequence

        // ------------------------------------------------------------------
        // Phase 3: Transition to attention section
        // ------------------------------------------------------------------
        tl.to('.s4-vector-space', {
            opacity: 0.3,
            scale: 0.9,
            y: -10,
            duration: 0.5,
            ease: 'power2.in',
        });
        tl.to('.s4-vector-space', {
            opacity: 0,
            duration: 0.3,
            display: 'none',
        });

        tl.to('.s4-attention-section', {
            opacity: 1,
            duration: 0.5,
        });

        // ------------------------------------------------------------------
        // Phase 4: Build attention visualization
        // ------------------------------------------------------------------
        tl.call(() => this._buildAttentionViz());
        tl.to({}, { duration: 2.8 }); // wait for arcs to draw

        // ------------------------------------------------------------------
        // Phase 5: Spawn flowing particles on attention arcs (independent tweens)
        // ------------------------------------------------------------------
        tl.call(() => this._spawnAttentionParticles());

        // ------------------------------------------------------------------
        // Phase 6: Layer diagram slides in from below
        // ------------------------------------------------------------------
        tl.to('.s4-layer-diagram', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
        });
        tl.from('.s4-layer-diagram .layer-block', {
            opacity: 0,
            y: 15,
            stagger: 0.25,
            duration: 0.4,
        }, '-=0.3');

        // ------------------------------------------------------------------
        // Phase 7: Narration
        // ------------------------------------------------------------------
        tl.from('.step-narration', { opacity: 0, y: 20, duration: 0.6 });

        return tl;
    },

    _buildVectorSpace() {
        const svg = d3.select('.s4-space-svg');
        const width = 520, height = 380;
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // -- Defs --
        const defs = svg.append('defs');

        // Arrow marker
        defs.append('marker')
            .attr('id', 's4-arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 8).attr('refY', 5)
            .attr('markerWidth', 8).attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', '#fbbf24');

        defs.append('marker')
            .attr('id', 's4-arrowhead-pink')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', 8).attr('refY', 5)
            .attr('markerWidth', 8).attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
            .attr('fill', '#ec4899');

        // Glow filter
        const glowFilter = defs.append('filter')
            .attr('id', 's4-glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '5')
            .attr('result', 'blur');
        const merge = glowFilter.append('feMerge');
        merge.append('feMergeNode').attr('in', 'blur');
        merge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Bright flash filter
        const flashFilter = defs.append('filter')
            .attr('id', 's4-flash')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        flashFilter.append('feGaussianBlur')
            .attr('stdDeviation', '10')
            .attr('result', 'blur');
        const flashMerge = flashFilter.append('feMerge');
        flashMerge.append('feMergeNode').attr('in', 'blur');
        flashMerge.append('feMergeNode').attr('in', 'blur');
        flashMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Radial gradients for orbs
        ['pink', 'purple'].forEach(color => {
            const hex = color === 'pink' ? '#ec4899' : '#a855f7';
            const grad = defs.append('radialGradient')
                .attr('id', `s4-orb-${color}`)
                .attr('cx', '40%').attr('cy', '40%').attr('r', '60%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', 0.9);
            grad.append('stop').attr('offset', '35%').attr('stop-color', hex).attr('stop-opacity', 0.85);
            grad.append('stop').attr('offset', '100%').attr('stop-color', hex).attr('stop-opacity', 0.15);
        });

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // ---- Subtle grid lines (dark space) ----
        const gridG = g.append('g').attr('class', 's4-grid');
        for (let i = 0; i <= 12; i++) {
            const xPos = (innerW / 12) * i;
            const yPos = (innerH / 12) * i;
            gridG.append('line')
                .attr('x1', xPos).attr('y1', 0)
                .attr('x2', xPos).attr('y2', innerH)
                .attr('stroke', 'rgba(255,255,255,0.025)')
                .attr('stroke-width', 0.5);
            gridG.append('line')
                .attr('x1', 0).attr('y1', yPos)
                .attr('x2', innerW).attr('y2', yPos)
                .attr('stroke', 'rgba(255,255,255,0.025)')
                .attr('stroke-width', 0.5);
        }

        // ---- Orb positions (diamond/rectangle pattern) ----
        // Man (bottom-left), King (top-left), Woman (bottom-right), Queen (top-right)
        const points = {
            man:   { cx: innerW * 0.22, cy: innerH * 0.68, color: 'purple', label: 'Man' },
            king:  { cx: innerW * 0.22, cy: innerH * 0.22, color: 'pink',   label: 'King' },
            woman: { cx: innerW * 0.72, cy: innerH * 0.68, color: 'purple', label: 'Woman' },
            queen: { cx: innerW * 0.72, cy: innerH * 0.22, color: 'pink',   label: 'Queen' },
        };

        // Store points for arithmetic animation
        this._vecPoints = points;
        this._vecG = g;
        this._vecInnerW = innerW;
        this._vecInnerH = innerH;

        // Draw four orbs with staggered appearance
        const orbOrder = ['king', 'man', 'woman', 'queen'];

        orbOrder.forEach((key, i) => {
            const p = points[key];
            const orbG = g.append('g')
                .attr('class', `s4-orb-group s4-orb-${key}`)
                .attr('transform', `translate(${p.cx}, ${p.cy})`);

            // Halo
            orbG.append('circle')
                .attr('class', 's4-orb-halo')
                .attr('r', 0)
                .attr('fill', 'none')
                .attr('stroke', p.color === 'pink' ? '#ec4899' : '#a855f7')
                .attr('stroke-width', 1)
                .attr('opacity', 0);

            // Core orb
            orbG.append('circle')
                .attr('class', 's4-orb-core')
                .attr('r', 0)
                .attr('fill', `url(#s4-orb-${p.color})`)
                .attr('filter', 'url(#s4-glow)')
                .attr('opacity', 0);

            // Label
            orbG.append('text')
                .attr('class', 's4-orb-label')
                .attr('y', -22)
                .attr('text-anchor', 'middle')
                .attr('fill', '#e8e8f0')
                .style('font-size', '14px')
                .style('font-weight', '600')
                .style('font-family', 'Space Grotesk, sans-serif')
                .style('text-shadow', `0 0 10px ${p.color === 'pink' ? '#ec4899' : '#a855f7'}`)
                .attr('opacity', 0)
                .text(p.label);

            // Staggered pop-in
            this._timeouts.push(setTimeout(() => {
                orbG.select('.s4-orb-core')
                    .transition().duration(500)
                    .ease(d3.easeElasticOut.amplitude(1).period(0.4))
                    .attr('r', 10)
                    .attr('opacity', 1);

                orbG.select('.s4-orb-halo')
                    .transition().duration(600).delay(80)
                    .attr('r', 24)
                    .attr('opacity', 0.2);

                orbG.select('.s4-orb-label')
                    .transition().duration(400).delay(200)
                    .attr('opacity', 1);
            }, 200 + i * 250));
        });
    },

    _animateVectorArithmetic() {
        const g = this._vecG;
        const pts = this._vecPoints;
        if (!g || !pts) return;

        const manP = pts.man;
        const kingP = pts.king;
        const womanP = pts.woman;
        const queenP = pts.queen;

        // ---- Step A: Draw arrow from Man to King (royalty direction) ----
        // Delay to allow orbs to finish appearing
        const baseDelay = 1200;

        this._timeouts.push(setTimeout(() => {
            // Arrow path from Man to King
            const arrowPath = g.append('line')
                .attr('class', 's4-royalty-arrow')
                .attr('x1', manP.cx).attr('y1', manP.cy)
                .attr('x2', manP.cx).attr('y2', manP.cy)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 2.5)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', 'url(#s4-arrowhead)')
                .attr('filter', 'url(#s4-glow)')
                .attr('opacity', 0.9);

            // Animate the arrow drawing itself
            arrowPath.transition().duration(800)
                .ease(d3.easeCubicOut)
                .attr('x2', kingP.cx).attr('y2', kingP.cy);

            // "royalty direction" label
            const labelX = manP.cx - 45;
            const labelY = (manP.cy + kingP.cy) / 2;
            const dirLabel = g.append('text')
                .attr('x', labelX).attr('y', labelY)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fbbf24')
                .style('font-size', '11px')
                .style('font-family', 'JetBrains Mono, monospace')
                .style('text-shadow', '0 0 8px rgba(251, 191, 36, 0.5)')
                .attr('opacity', 0)
                .text('royalty');

            dirLabel.transition().delay(600).duration(400)
                .attr('opacity', 0.8);

            // Formula: "King" appears
            gsap.to('.s4-f-king', { opacity: 1, duration: 0.3, delay: 0.2 });
        }, baseDelay));

        // ---- Step B: Arrow "minus" Man, "plus" formula ----
        this._timeouts.push(setTimeout(() => {
            gsap.to('.s4-f-minus', { opacity: 1, duration: 0.2 });
            gsap.to('.s4-f-man', { opacity: 1, duration: 0.3, delay: 0.1 });
            gsap.to('.s4-f-plus', { opacity: 1, duration: 0.2, delay: 0.3 });
            gsap.to('.s4-f-woman', { opacity: 1, duration: 0.3, delay: 0.4 });
        }, baseDelay + 1000));

        // ---- Step C: Duplicate arrow, fly it to Woman's position ----
        this._timeouts.push(setTimeout(() => {
            // The arrow vector: direction from Man to King
            const dx = kingP.cx - manP.cx;
            const dy = kingP.cy - manP.cy;

            // Create duplicate arrow starting at the original position
            const dupArrow = g.append('line')
                .attr('class', 's4-dup-arrow')
                .attr('x1', manP.cx).attr('y1', manP.cy)
                .attr('x2', kingP.cx).attr('y2', kingP.cy)
                .attr('stroke', '#fbbf24')
                .attr('stroke-width', 2.5)
                .attr('stroke-linecap', 'round')
                .attr('marker-end', 'url(#s4-arrowhead)')
                .attr('filter', 'url(#s4-glow)')
                .attr('opacity', 0.9);

            // Glow brighter
            dupArrow.transition().duration(300)
                .attr('stroke-width', 3.5)
                .attr('opacity', 1)
                .transition().duration(900)
                .ease(d3.easeCubicInOut)
                .attr('x1', womanP.cx).attr('y1', womanP.cy)
                .attr('x2', womanP.cx + dx).attr('y2', womanP.cy + dy)
                .attr('stroke-width', 2.5)
                .attr('opacity', 0.9);

            // Fade original arrow slightly
            g.select('.s4-royalty-arrow')
                .transition().delay(200).duration(400)
                .attr('opacity', 0.35);
        }, baseDelay + 2200));

        // ---- Step D: Arrow tip lands on Queen -- flash effect ----
        this._timeouts.push(setTimeout(() => {
            const queenOrb = g.select('.s4-orb-queen');

            // Queen orb PULSES with bright flash
            queenOrb.select('.s4-orb-core')
                .transition().duration(200)
                .attr('r', 18)
                .attr('filter', 'url(#s4-flash)')
                .transition().duration(600)
                .ease(d3.easeElasticOut.amplitude(1).period(0.5))
                .attr('r', 12)
                .attr('filter', 'url(#s4-glow)');

            queenOrb.select('.s4-orb-halo')
                .transition().duration(200)
                .attr('r', 40)
                .attr('opacity', 0.5)
                .transition().duration(800)
                .attr('r', 28)
                .attr('opacity', 0.2);

            // Formula "= Queen" appears with dramatic effect
            gsap.to('.s4-f-equals', {
                opacity: 1,
                scale: 1.3,
                duration: 0.4,
                ease: 'back.out(2)',
            });
            gsap.to('.s4-f-equals', {
                scale: 1,
                duration: 0.3,
                delay: 0.4,
            });

            gsap.to('.s4-f-queen', {
                opacity: 1,
                duration: 0.5,
                delay: 0.3,
                ease: 'power2.out',
            });
            gsap.fromTo('.s4-f-queen', {
                textShadow: '0 0 0px rgba(236, 72, 153, 0)',
            }, {
                textShadow: '0 0 25px rgba(236, 72, 153, 0.7)',
                duration: 0.5,
                delay: 0.5,
                yoyo: true,
                repeat: 2,
            });
        }, baseDelay + 3500));
    },

    _buildAttentionViz() {
        const svg = d3.select('.attention-svg');
        const words = ['The', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
        const wordWidth = 85;
        const startX = 350 - (words.length * wordWidth) / 2;
        const wordY = 165;

        // -- Defs --
        const defs = svg.append('defs');

        const arcGlow = defs.append('filter')
            .attr('id', 's4-arc-glow')
            .attr('x', '-50%').attr('y', '-50%')
            .attr('width', '200%').attr('height', '200%');
        arcGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');
        const arcMerge = arcGlow.append('feMerge');
        arcMerge.append('feMergeNode').attr('in', 'blur');
        arcMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // ---- Draw word boxes ----
        words.forEach((word, i) => {
            const cx = startX + i * wordWidth + wordWidth / 2;

            svg.append('rect')
                .attr('x', cx - 32).attr('y', wordY - 16)
                .attr('width', 64).attr('height', 32)
                .attr('rx', 8)
                .attr('fill', 'rgba(236, 72, 153, 0.08)')
                .attr('stroke', 'rgba(236, 72, 153, 0.35)')
                .attr('stroke-width', 1)
                .attr('opacity', 0)
                .transition().delay(i * 80).duration(350)
                .attr('opacity', 1);

            svg.append('text')
                .attr('x', cx).attr('y', wordY + 4)
                .attr('text-anchor', 'middle')
                .attr('fill', '#e8e8f0')
                .style('font-size', '13px')
                .style('font-family', 'JetBrains Mono, monospace')
                .attr('opacity', 0)
                .text(word)
                .transition().delay(i * 80 + 100).duration(300)
                .attr('opacity', 1);
        });

        // ---- Attention arcs: [from, to, strength, opacity] ----
        const arcs = [
            [1, 2, 4.0, 0.7],    // fox -> jumps (thick, strong)
            [5, 6, 3.5, 0.65],   // lazy -> dog (thick)
            [0, 1, 1.5, 0.35],   // The -> fox (thin)
            [3, 4, 2.0, 0.45],   // over -> the
            [2, 3, 2.0, 0.45],   // jumps -> over
            [4, 6, 1.8, 0.4],    // the -> dog
        ];

        // Store arc paths for particle animation
        this._arcPaths = [];

        arcs.forEach((arc, idx) => {
            const [from, to, strength, arcOpacity] = arc;
            const x1 = startX + from * wordWidth + wordWidth / 2;
            const x2 = startX + to * wordWidth + wordWidth / 2;
            const midX = (x1 + x2) / 2;
            const dist = Math.abs(to - from);
            const curveHeight = wordY - 30 - dist * 20;

            const pathD = `M ${x1} ${wordY - 16} Q ${midX} ${curveHeight} ${x2} ${wordY - 16}`;

            const path = svg.append('path')
                .attr('class', 's4-attn-arc')
                .attr('d', pathD)
                .attr('fill', 'none')
                .attr('stroke', '#ec4899')
                .attr('stroke-width', strength)
                .attr('stroke-linecap', 'round')
                .attr('filter', 'url(#s4-arc-glow)')
                .attr('opacity', 0);

            const totalLength = path.node().getTotalLength();
            path.attr('stroke-dasharray', totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition().delay(550 + idx * 220).duration(700)
                .attr('stroke-dashoffset', 0)
                .attr('opacity', arcOpacity);

            // Store for particle animation
            this._arcPaths.push({
                pathNode: path.node(),
                pathD: pathD,
                strength: strength,
                totalLength: totalLength,
            });
        });
    },

    _spawnAttentionParticles() {
        // Create flowing particles along each attention arc as independent infinite tweens
        const svg = d3.select('.attention-svg');

        if (!this._arcPaths) return;

        this._arcPaths.forEach((arcData, arcIdx) => {
            const pathNode = arcData.pathNode;
            const totalLen = arcData.totalLength;
            // More particles for stronger connections
            const particleCount = Math.max(1, Math.round(arcData.strength / 1.5));

            for (let p = 0; p < particleCount; p++) {
                const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                particle.setAttribute('r', String(1 + arcData.strength * 0.3));
                particle.setAttribute('fill', '#ec4899');
                particle.setAttribute('opacity', '0');

                const svgEl = document.querySelector('.attention-svg');
                if (!svgEl) return;
                svgEl.appendChild(particle);

                // Use a proxy object for the progress
                const proxy = { progress: 0 };
                const startDelay = p * (2 / particleCount) + arcIdx * 0.3;

                const tw = gsap.to(proxy, {
                    progress: 1,
                    duration: 1.8 + Math.random() * 0.8,
                    delay: startDelay,
                    ease: 'none',
                    repeat: -1,
                    onUpdate: () => {
                        try {
                            const point = pathNode.getPointAtLength(proxy.progress * totalLen);
                            particle.setAttribute('cx', String(point.x));
                            particle.setAttribute('cy', String(point.y));
                            // Fade in near start, fade out near end
                            const fadeIn = Math.min(proxy.progress * 5, 1);
                            const fadeOut = Math.min((1 - proxy.progress) * 5, 1);
                            particle.setAttribute('opacity', String(0.7 * fadeIn * fadeOut));
                        } catch (e) {
                            // path might be removed during cleanup
                        }
                    },
                });

                this._particleTweens.push(tw);
            }
        });
    },

    cleanup() {
        // Clear all timeouts
        this._timeouts.forEach(tid => clearTimeout(tid));
        this._timeouts = [];

        // Kill particle tweens
        this._particleTweens.forEach(tw => tw.kill());
        this._particleTweens = [];

        // Kill float tweens
        this._floatTweens.forEach(tw => tw.kill());
        this._floatTweens = [];

        // Clean up stored references
        this._arcPaths = [];
        this._vecPoints = null;
        this._vecG = null;

        // Clear D3 SVG content
        d3.select('.s4-space-svg').selectAll('*').remove();
        d3.select('.attention-svg').selectAll('*').remove();

        // Kill any lingering GSAP tweens
        gsap.killTweensOf('.s4-f-king');
        gsap.killTweensOf('.s4-f-minus');
        gsap.killTweensOf('.s4-f-man');
        gsap.killTweensOf('.s4-f-plus');
        gsap.killTweensOf('.s4-f-woman');
        gsap.killTweensOf('.s4-f-equals');
        gsap.killTweensOf('.s4-f-queen');
        gsap.killTweensOf('.s4-vector-space');
        gsap.killTweensOf('.s4-attention-section');
        gsap.killTweensOf('.s4-layer-diagram');
    },
};
