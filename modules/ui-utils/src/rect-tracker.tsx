import {ReactNode, useEffect, useRef} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const RectTracker = ({
    setRect,
    children
}: {
    setRect: (rect: DOMRect) => void
    children: ReactNode
}) => {
    const editorElement = useRef<HTMLDivElement>(null)
    const {layoutConfig} = useLayoutConfig()

    const updateCoordinates = () => {
        if (editorElement.current) {
            const rect = editorElement.current.getBoundingClientRect()
            setRect(rect)
        }
    }

    useEffect(() => {
        updateCoordinates()

        window.addEventListener("resize", updateCoordinates)
        return () => window.removeEventListener("resize", updateCoordinates)
    }, [layoutConfig])

    return <div ref={editorElement}>
        {children}
    </div>
}