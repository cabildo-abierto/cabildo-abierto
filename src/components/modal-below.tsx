import { ReactNode, useEffect, useRef } from "react";


export const ModalBelow = ({children, open, setOpen, className, hoverOnly=false}: 
    {
        children: ReactNode
        open: boolean
        setOpen: (v: boolean) => void
        className: string
        hoverOnly?: boolean
    }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && panelRef.current) {
            const panel = panelRef.current;
            const boundingRect = panel.getBoundingClientRect();
            const screenWidth = window.innerWidth
            if (boundingRect.right > screenWidth) {
                panel.style.left = `${screenWidth - boundingRect.width - boundingRect.left - 5}px`;
            } else if (boundingRect.left < 0) {
                panel.style.left = `${0}px`;
            }
        }
    }, [open]);

    return <>{!hoverOnly && open && <div
            className="fixed left-0 top-0 h-screen w-screen z-1000"
            onClick={() => {setOpen(false)}}
        >
        </div>}
        {<div
            ref={panelRef}
            className={"absolute top-full left-0 z-1000 sm:px-0 px-2 bg-[var(--background)] " + className + (open ? "" : "hidden")}
            onMouseLeave={() => {if(hoverOnly) {setOpen(false);}}}
            onMouseEnter={() => {if(hoverOnly) {setOpen(true);}}}
        >
            {children}
        </div>}
    </>
}