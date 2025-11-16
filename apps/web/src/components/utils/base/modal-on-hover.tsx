import React, {ReactNode} from 'react';
import {HoverCard, HoverCardContent, HoverCardTrigger} from "../ui/hover-card";

type ModalOnHoverProps = {
    children: ReactNode
    modal: ReactNode
    className?: string
}

export const ModalOnHover = ({
                                 children,
                                 modal,
                                 className="max-w-[300px]"
                             }: ModalOnHoverProps) => {

    return (
        <HoverCard openDelay={300} closeDelay={0}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent
                className={className}
                align={"start"}
            >
                {modal}
            </HoverCardContent>
        </HoverCard>
    )
}
