import { ParticleBackground } from './particle-background.js';
import { TimelineController } from './timeline-controller.js';
import step1 from './steps/step1-raw-text.js';
import step2 from './steps/step2-tokenization.js';
import step3 from './steps/step3-embeddings.js';
import step4 from './steps/step4-relationships.js';
import step5 from './steps/step5-prediction.js';
import step6 from './steps/step6-scaling.js';
import step7 from './steps/step7-conclusion.js';

// Boot application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle background
    const particleBg = new ParticleBackground('particle-canvas');
    particleBg.start();

    // Initialize timeline controller
    const controller = new TimelineController(particleBg);

    // Register all steps
    controller.registerStep(step1);
    controller.registerStep(step2);
    controller.registerStep(step3);
    controller.registerStep(step4);
    controller.registerStep(step5);
    controller.registerStep(step6);
    controller.registerStep(step7);

    // Start at step 1
    controller.start();

    // Listen for replay event from conclusion step
    window.addEventListener('replay', () => {
        controller.goToStep(0);
    });
});
