

let scrollFrame: number | undefined;

export function smoothScrollTo(target: HTMLElement | number, duration = 600, onComplete?: () => void) {
    if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
    const start = window.scrollY;
    const targetPosition = typeof target === 'number' ? target : target.getBoundingClientRect().top + start - 60;
    const startTime = performance.now();

    function scroll(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.max(Math.min(elapsed / duration, 1), 0);

        const easing = progress * (2 - progress);

        const stepDestination = start + (targetPosition - start) * easing
        window.scrollTo({top: stepDestination, behavior: "instant"});

        if (progress < 1) {
            scrollFrame = requestAnimationFrame(scroll);
        } else {
            scrollFrame = undefined;
            onComplete?.();
        }
    }

    scrollFrame = requestAnimationFrame(scroll);
}
