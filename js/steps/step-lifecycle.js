export function trackTimeout(step, id) {
    if (!step._trackedTimeouts) step._trackedTimeouts = [];
    step._trackedTimeouts.push(id);
    return id;
}

export function clearTrackedTimeouts(step) {
    if (!step._trackedTimeouts) return;
    step._trackedTimeouts.forEach((id) => clearTimeout(id));
    step._trackedTimeouts = [];
}

export function trackTween(step, tween, bucketName = 'default') {
    if (!step._trackedTweens) step._trackedTweens = {};
    if (!step._trackedTweens[bucketName]) step._trackedTweens[bucketName] = [];
    step._trackedTweens[bucketName].push(tween);
    return tween;
}

export function killTrackedTweens(step, bucketName) {
    if (!step._trackedTweens) return;

    const killBucket = (name) => {
        const bucket = step._trackedTweens[name] || [];
        bucket.forEach((tw) => {
            if (tw && typeof tw.kill === 'function') tw.kill();
        });
        step._trackedTweens[name] = [];
    };

    if (bucketName) {
        killBucket(bucketName);
        return;
    }

    Object.keys(step._trackedTweens).forEach(killBucket);
}

export function cleanupGsapSelectors(selectors) {
    selectors.forEach((selector) => gsap.killTweensOf(selector));
}
