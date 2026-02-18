import { STEP_COLORS, STEP_NAMES } from './config.js';

export class TimelineController {
    constructor(particleBg) {
        this.currentStep = -1;
        this.totalSteps = 7;
        this.isAnimating = false;
        this.steps = [];
        this.currentTimeline = null;
        this.particleBg = particleBg;

        // DOM refs
        this.stage = document.getElementById('stage');
        this.progressBar = document.getElementById('progress-bar');
        this.stepCounter = document.getElementById('step-counter');
        this.btnPrev = document.getElementById('btn-prev');
        this.btnNext = document.getElementById('btn-next');
        this.pills = document.querySelectorAll('.step-pill');

        this.bindEvents();
    }

    registerStep(stepModule) {
        this.steps.push(stepModule);
    }

    bindEvents() {
        this.btnNext.addEventListener('click', () => this.next());
        this.btnPrev.addEventListener('click', () => this.prev());

        this.pills.forEach(pill => {
            pill.addEventListener('click', () => {
                const idx = parseInt(pill.dataset.step);
                this.goToStep(idx);
            });
        });

        document.addEventListener('keydown', (e) => {
            // Don't capture keys when an interactive element is focused
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                e.preventDefault();
                this.prev();
            } else if (e.key >= '1' && e.key <= '7') {
                e.preventDefault();
                this.goToStep(parseInt(e.key) - 1);
            }
        });
    }

    async goToStep(index) {
        if (index < 0 || index >= this.totalSteps || index === this.currentStep) return;

        if (this.isAnimating) {
            // Fast-forward current animation
            if (this.currentTimeline) {
                this.currentTimeline.progress(1);
            }
            this.isAnimating = false;
        }

        this.isAnimating = true;
        const direction = index > this.currentStep ? 1 : -1;

        // Exit current step
        if (this.currentStep >= 0 && this.steps[this.currentStep]) {
            if (this.currentTimeline) {
                this.currentTimeline.kill();
                this.currentTimeline = null;
            }
            await this.exitStep(this.currentStep, direction);
            this.steps[this.currentStep].cleanup();
        }

        this.currentStep = index;

        // Update accent color
        const color = STEP_COLORS[index];
        document.documentElement.style.setProperty('--step-accent', color);
        if (this.particleBg) {
            this.particleBg.setAccentColor(color);
        }

        // Clear and build new step
        this.stage.innerHTML = '';
        this.steps[index].build(this.stage);

        // Enter new step
        this.currentTimeline = this.steps[index].enter();
        this.updateUI();

        if (this.currentTimeline) {
            this.currentTimeline.eventCallback('onComplete', () => {
                this.isAnimating = false;
            });
        } else {
            this.isAnimating = false;
        }
    }

    exitStep(index, direction) {
        return new Promise(resolve => {
            const container = this.stage.querySelector('.step-container');
            if (!container) {
                resolve();
                return;
            }
            gsap.to(container, {
                opacity: 0,
                x: direction * -60,
                scale: 0.96,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: resolve,
            });
        });
    }

    next() {
        if (this.currentStep < this.totalSteps - 1) {
            this.goToStep(this.currentStep + 1);
        } else {
            // Replay from start
            this.goToStep(0);
        }
    }

    prev() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
        }
    }

    updateUI() {
        const i = this.currentStep;

        // Progress bar
        this.progressBar.style.width = `${((i + 1) / this.totalSteps) * 100}%`;

        // Step counter
        this.stepCounter.textContent = `Step ${i + 1} of ${this.totalSteps}`;

        // Nav buttons
        this.btnPrev.disabled = i === 0;
        if (i === this.totalSteps - 1) {
            this.btnNext.innerHTML = 'Replay <span>&#8635;</span>';
        } else {
            this.btnNext.innerHTML = `Next: ${STEP_NAMES[i + 1]} <span>&#8594;</span>`;
        }

        // Pills
        this.pills.forEach((pill, idx) => {
            pill.classList.remove('active', 'completed');
            if (idx === i) {
                pill.classList.add('active');
            } else if (idx < i) {
                pill.classList.add('completed');
            }
        });
    }

    start() {
        this.goToStep(0);
    }
}
