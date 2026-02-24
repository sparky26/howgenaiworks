export class TimelineController {
    constructor(particleBg, stepRegistry = []) {
        this.currentStep = -1;
        this.isAnimating = false;
        this.steps = stepRegistry;
        this.currentTimeline = null;
        this.pendingStep = null;
        this.particleBg = particleBg;

        // DOM refs
        this.stage = document.getElementById('stage');
        this.progressBar = document.getElementById('progress-bar');
        this.stepCounter = document.getElementById('step-counter');
        this.btnPrev = document.getElementById('btn-prev');
        this.btnNext = document.getElementById('btn-next');
        this.pills = Array.from(document.querySelectorAll('.step-pill'));

        this.bindEvents();
    }

    get totalSteps() {
        return this.steps.length;
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
            // Ignore auto-repeated keydown events while a key is held
            if (e.repeat) return;

            // Don't capture keys when an interactive element is focused
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
                e.preventDefault();
                this.prev();
            } else if (/^[1-9]$/.test(e.key)) {
                const stepIndex = parseInt(e.key) - 1;
                if (stepIndex < this.totalSteps) {
                    e.preventDefault();
                    this.goToStep(stepIndex);
                }
            }
        });
    }

    async goToStep(index) {
        if (index < 0 || index >= this.totalSteps || index === this.currentStep) return;

        if (this.isAnimating) {
            this.pendingStep = index;
            return;
        }

        this.isAnimating = true;
        this.pendingStep = null;
        const direction = index > this.currentStep ? 1 : -1;

        // Exit current step
        if (this.currentStep >= 0 && this.steps[this.currentStep]) {
            if (this.currentTimeline) {
                this.currentTimeline.kill();
                this.currentTimeline = null;
            }
            await this.exitStep(this.currentStep, direction);
            this.steps[this.currentStep].module.cleanup();
        }

        this.currentStep = index;

        const showStageOverflow = index === 2 || index === 3;
        this.stage.classList.toggle('stage-overflow-visible', showStageOverflow);

        // Update accent color
        const color = this.steps[index].color;
        document.documentElement.style.setProperty('--step-accent', color);
        if (this.particleBg) {
            this.particleBg.setAccentColor(color);
        }

        // Clear and build new step
        this.stage.innerHTML = '';
        this.steps[index].module.build(this.stage);

        // Enter new step
        this.currentTimeline = this.steps[index].module.enter();
        this.updateUI();

        if (this.currentTimeline) {
            this.currentTimeline.eventCallback('onComplete', () => {
                this.isAnimating = false;
                this.flushPendingStep();
            });
        } else {
            this.isAnimating = false;
            this.flushPendingStep();
        }
    }


    flushPendingStep() {
        if (this.pendingStep === null || this.pendingStep === this.currentStep) return;
        const nextStep = this.pendingStep;
        this.pendingStep = null;
        this.goToStep(nextStep);
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
        const activeModule = this.steps[this.currentStep]?.module;
        if (activeModule?.handleNext?.()) {
            this.updateUI();
            return;
        }

        if (this.currentStep < this.totalSteps - 1) {
            this.goToStep(this.currentStep + 1);
        } else {
            // Replay from start
            this.goToStep(0);
        }
    }

    prev() {
        const activeModule = this.steps[this.currentStep]?.module;
        if (activeModule?.handlePrev?.()) {
            this.updateUI();
            return;
        }

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
        const activeModule = this.steps[i]?.module;
        const navState = activeModule?.getNavigationState?.() || null;

        this.btnPrev.disabled = navState?.prevDisabled ?? i === 0;
        if (navState?.nextLabel) {
            this.btnNext.innerHTML = `${navState.nextLabel} <span>&#8594;</span>`;
        } else if (i === this.totalSteps - 1) {
            this.btnNext.innerHTML = 'Replay <span>&#8635;</span>';
        } else {
            this.btnNext.innerHTML = `Next: ${this.steps[i + 1].name} <span>&#8594;</span>`;
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
