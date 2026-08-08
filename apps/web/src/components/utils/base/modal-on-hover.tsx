import React, {ReactNode} from 'react';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "../ui/hover-card";

type ModalOnHoverProps = {
    children: ReactNode
    modal: ReactNode
    className?: string
    openDelay?: number
    closeDelay?: number
}

export const ModalOnHover = ({
                                 children,
                                 modal,
                                 className="max-w-[300px]",
                                 openDelay=300,
                                 closeDelay=300
                             }: ModalOnHoverProps) => {

    return (
        <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent
                className={className}
                align={"start"}
                sideOffset={8}
                onPointerDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
            >
                {modal}
            </HoverCardContent>
        </HoverCard>
    )
}
