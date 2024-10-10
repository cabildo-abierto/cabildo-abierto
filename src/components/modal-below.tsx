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
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        if (open && panelRef.current) {
            const panel = panelRef.current;
            const boundingRect = panel.getBoundingClientRect();
            if (boundingRect.right > window.innerWidth) {
                panel.style.left = `${window.innerWidth - boundingRect.width - boundingRect.left}px`;
            } else if (boundingRect.left < 0) {
                panel.style.left = `${0}px`;
            }
        }
    }, [open]);

    return <div
        ref={panelRef}
        className={"absolute text-gray-900 top-full left-0 z-10 sm:px-0 px-2 " + className}
        onMouseEnter={() => {if(hoverOnly) setOpen(true)}}
        onMouseLeave={() => {if(hoverOnly) setOpen(false)}}
    >
        {children}
    </div>
}