"use client";

import {useEffect, useState, type MouseEvent} from 'react';

export function useEndpointSelection() {
    const [selectedId, setSelectedId] = useState('');

    useEffect(() => {
        function syncLocation() {
            try {
                setSelectedId(decodeURIComponent(window.location.hash.slice(1)));
            } catch {
                setSelectedId('');
            }
        }
        syncLocation();
        window.addEventListener('hashchange', syncLocation);
        window.addEventListener('popstate', syncLocation);
        return () => {
            window.removeEventListener('hashchange', syncLocation);
            window.removeEventListener('popstate', syncLocation);
        };
    }, []);

    function selectEndpoint(event: MouseEvent<HTMLAnchorElement>, id: string) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (id === selectedId) return;
        window.history.pushState(null, '', `#${encodeURIComponent(id)}`);
        setSelectedId(id);
        window.scrollTo({top: 0, behavior: 'instant'});
    }

    return {selectedId, selectEndpoint};
}
