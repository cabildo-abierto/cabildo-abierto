import React, {ReactNode, useState} from 'react';
import DescriptionOnHover from "./description-on-hover";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {cn} from "@/lib/utils";


type ClickableModalOnClickProps = {
    children: ReactNode
    modal: (close: () => void) => ReactNode
    className?: string
    description?: string
}

export const ModalOnClick = ({
                                 children,
                                 modal,
                                 description,
    className
                             }: ClickableModalOnClickProps) => {
    const [open, setOpen] = useState(false);

    function onClose() {
        setOpen(false)
    }

    return <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
            <DescriptionOnHover description={!open ? description : undefined}>
                {children}
            </DescriptionOnHover>
        </PopoverTrigger>
        <PopoverContent className={cn("z-[1002]", className)}>
            {modal(onClose)}
        </PopoverContent>
    </Popover>
}

