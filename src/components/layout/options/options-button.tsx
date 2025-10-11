import {ModalOnClick} from "../utils/modal-on-click";
import {IconButton} from '../utils/icon-button';
import {DotsThreeIcon} from '@phosphor-icons/react';
import {Color} from "../utils/color";
import {ReactNode} from "react";


export const OptionsButton = ({
                                  children,
                                  iconFontSize,
                                  iconHoverColor = "background-dark"
                              }: {
    children: (onClose: () => void) => ReactNode
    iconFontSize?: number
    iconHoverColor?: Color
}) => {
    const modal = (onClose: () => void) => (
        <div className="text-base p-1 z-[3000] flex flex-col space-y-1">
            {children(onClose)}
        </div>
    )

    return <ModalOnClick modal={modal} className={"mt-2 panel-dark"}>
        <IconButton
            color="transparent"
            size={"small"}
            sx={{borderRadius: 0}}
            hoverColor={iconHoverColor}
        >
            <DotsThreeIcon color="var(--text)" weight="bold" fontSize={iconFontSize}/>
        </IconButton>
    </ModalOnClick>
};