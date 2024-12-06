import { ReactNode, useEffect, useState, useRef, useCallback } from 'react';

interface LazyLoadFeedProps {
    generator: (index: number) => {c: ReactNode, key: string}
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
        <div className="w-full flex flex-col items-center">
            {Array.from({ length: Math.min(visibleCount, maxSize) }, (_, index) => {
                const {c, key} = generator(index)
                return <div key={key} className="w-full flex justify-center">
                    {c}
                </div>
            })}

            <div ref={observerRef} className="w-full h-1" />
        </div>
    );
};
