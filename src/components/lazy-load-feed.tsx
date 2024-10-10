import { ReactNode, useEffect, useState, useRef, useCallback } from 'react';

interface LazyLoadFeedProps {
    generator: (index: number) => ReactNode
    maxSize: number
    initialCount?: number
    loadMoreCount?: number
}

export const LazyLoadFeed = ({ generator, maxSize, initialCount = 10, loadMoreCount = 10 }: LazyLoadFeedProps) => {
    const [visibleCount, setVisibleCount] = useState<number>(initialCount);
    const observerRef = useRef<HTMLDivElement | null>(null);

    // Callback for intersection observer to load more items
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting) {
            setVisibleCount((prev) => Math.min(prev + loadMoreCount, maxSize)); // Load more items when intersecting
        }
    }, [loadMoreCount]);

    // Set up the intersection observer
    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '0px',
            threshold: 1.0, // When the last element is fully visible
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [handleObserver]);

    return (
        <div className="lazy-load-feed space-y-2">
            {Array.from({ length: visibleCount }, (_, index) => (
                <div key={index} className="feed-item">
                    {generator(index)}
                </div>
            ))}

            <div ref={observerRef} className="w-full h-1" />
        </div>
    );
};
