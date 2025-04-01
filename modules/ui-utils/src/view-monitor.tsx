"use client"
import React, {ReactNode, useEffect, useRef, useState} from "react";
import {addView} from "@/server-actions/reactions";
import {useUser} from "@/hooks/swr";


export const ViewMonitor = ({children, uri}: {children: ReactNode, uri: string}) => {
    const { user } = useUser();
    const viewRecordedRef = useRef(false);
    const contentRef = useRef(null);

    const useVisibility = (ref) => {
        const [isVisible, setIsVisible] = useState(false);

        useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
                setIsVisible(entry.isIntersecting);
            });
            if (ref.current) observer.observe(ref.current);

            return () => {
                if (ref.current) observer.unobserve(ref.current);
            };
        }, [ref]);

        return isVisible;
    };

    const isVisible = useVisibility(contentRef);

    useEffect(() => {
        async function recordView() {
            if (isVisible && user && !viewRecordedRef.current) {
                viewRecordedRef.current = true;
                await addView(uri, user.did);
            }
        }
        recordView()
    }, [isVisible, user, uri]);

    // agregamos ref a children directamente
    return <div ref={contentRef} className={"block w-full"}>
        {children}
    </div>
}