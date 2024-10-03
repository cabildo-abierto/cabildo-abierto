import { useState, useRef, useEffect } from "react";
import { NodeKey } from "lexical";
import { ContentProps } from "../../../../app/lib/definitions";
import { EntitySidebarCommentSection, SidebarCommentSection } from "../../../comment-section";

export function CommentsPanel({
    activeIDs,
    parentContent,
    markNodeMap
}: {
    activeIDs: string[],
    parentContent: ContentProps,
    markNodeMap: Map<string, Set<NodeKey>>
}): JSX.Element {
    const [width, setWidth] = useState(350); // Set initial width
    const panelRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true;
        document.body.style.userSelect = "none"; // Disable text selection
        document.body.style.pointerEvents = "none"; // Disable pointer events
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isResizing.current && panelRef.current) {
            const newWidth = window.innerWidth - e.clientX; // Calculate new width
            setWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        document.body.style.userSelect = ""; // Re-enable text selection
        document.body.style.pointerEvents = ""; // Re-enable pointer events
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div
            ref={panelRef}
            className="fixed top-16 right-0 h-[calc(100vh-3.5rem)] bg-background/60 overflow-y-auto p-4 shadow-lg z-50"
            style={{ width: `${width}px` }} // Set dynamic width
        >
            {parentContent.type == "EntityContent" ? (
                <EntitySidebarCommentSection content={parentContent} activeIDs={activeIDs} />
            ) : (
                <SidebarCommentSection content={parentContent} activeIDs={activeIDs} />
            )}

            {/* Resizable Handler */}
            <div
                className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
                onMouseDown={handleMouseDown}
            ></div>
        </div>
    );
}
