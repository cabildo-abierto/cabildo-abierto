

function dist(x: number, y: number){
    return Math.abs(x-y)
}

export function smoothScrollTo(target: HTMLElement | number, duration = 600) {
    const start = window.scrollY;
    const targetPosition = typeof target === 'number' ? target : target.getBoundingClientRect().top + start - 60;
    const startTime = performance.now();

    function scroll(currentTime: any) {
        const elapsed = currentTime - startTime;
        const progress = Math.max(Math.min(elapsed / duration, 1), 0);

        const easing = progress * (2 - progress);

        const stepDestination = start + (targetPosition - start) * easing
        if (dist(start, targetPosition) > dist(stepDestination, targetPosition)) {
            window.scrollTo(0, stepDestination);
        }

        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }

    requestAnimationFrame(scroll);
}