import React, {ReactNode, useEffect, useRef, useState} from "react";


const addView = async (uri: string) => {
    // TO DO
}


const ViewMonitor = ({children, uri}: { children: ReactNode, uri: string }) => {
    const viewRecordedRef = useRef(false)
    const contentRef = useRef(null)

    const useVisibility = (ref) => {
        const [isVisible, setIsVisible] = useState(false)

        useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
                setIsVisible(entry.isIntersecting);
            })
            if (ref.current) observer.observe(ref.current)

            return () => {
                if (ref.current) observer.unobserve(ref.current)
            }
        }, [ref])

        return isVisible
    };

    const isVisible = useVisibility(contentRef);

    useEffect(() => {
        async function recordView() {
            if (isVisible && !viewRecordedRef.current) {
                viewRecordedRef.current = true;
                await addView(uri)
            }
        }

        recordView()
    }, [isVisible, uri])

    // agregamos ref a children directamente
    return <div ref={contentRef} className={"block w-full"}>
        {children}
    </div>
}


export default ViewMonitor;