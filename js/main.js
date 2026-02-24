import { ParticleBackground } from './particle-background.js';
import { TimelineController } from './timeline-controller.js';
import { STEPS } from './config.js';

function renderStepPills(registry) {
    const pillsContainer = document.getElementById('step-pills');
    pillsContainer.innerHTML = '';

    registry.forEach((step, index) => {
        const pill = document.createElement('button');
        pill.className = 'step-pill';
        pill.dataset.step = String(index);
        pill.innerHTML = `${index + 1}<span class="tooltip">${step.name}</span>`;
        pillsContainer.appendChild(pill);
    });
}

// Boot application
document.addEventListener('DOMContentLoaded', () => {
    renderStepPills(STEPS);

    // Initialize particle background
    const particleBg = new ParticleBackground('particle-canvas');
    particleBg.start();

    // Initialize timeline controller
    const controller = new TimelineController(particleBg, STEPS);

    // Start at step 1
    controller.start();

    // Listen for replay event from conclusion step
    window.addEventListener('replay', () => {
        controller.goToStep(0);
    });
});
