import { useState, useRef, useEffect } from "react";
import { NodeKey } from "lexical";


export function CommentsPanel({
    activeIDs,
    parentContent,
    markNodeMap,
    comments,
    onClose
}: {
    activeIDs: string[],
    parentContent: {cid: string, type: any, text?: string, childrenContents?: any[]},
    markNodeMap: Map<string, Set<NodeKey>>
    comments: any[]
    onClose: () => void
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
            className="fixed top-16 right-0 h-[calc(100vh-3.5rem)] overflow-y-auto bg-[var(--comments-panel-bg)] z-50 rounded-l"
            style={{
                width: `${width}px`, // Set dynamic width
                maxWidth: `${width}px`, // Prevent the panel from growing beyond this width
                overflowX: "hidden" // Prevent horizontal scrolling
            }}
        >
            <div className="flex justify-between px-2">
                <div className="text-[var(--text-light)] text-sm mt-1">Comentarios sobre el texto</div>
                <button onClick={onClose} className="text-[var(--text-light)] hover:text-[var(--text)] text-sm">cerrar</button>
            </div>
            {/*<div className="px-2">
            {parentContent.type == "EntityContent" ? (
                <EntitySidebarCommentSection content={parentContent} activeIDs={activeIDs} comments={comments}/>
            ) : (
                <SidebarCommentSection content={parentContent} activeIDs={activeIDs} comments={comments}/>
            )}
            </div>*/}

            <div
                className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
                onMouseDown={handleMouseDown}
            ></div>
        </div>
    );
}
