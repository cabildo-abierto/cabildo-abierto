import {ReactNode} from 'react';
import DescriptionOnHover from "./description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import DescriptionOnClick from "./description-on-click";
import {InfoIcon} from "@phosphor-icons/react";
import {Color} from './color';

export const InfoPanel = ({
                              text,
                              onClick,
                              moreInfoHref,
                              color = "text-light"
                          }: {
    text?: ReactNode,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
    moreInfoHref?: string
    color?: Color
}) => {
    const {isMobile} = useLayoutConfig()

    if (isMobile) {
        return <DescriptionOnClick description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize="20" color={`var(--${color}`} weight={"regular"}/>
            </div>
        </DescriptionOnClick>
    } else {
        return <DescriptionOnHover description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize="20" color={`var(--${color}`} weight={"regular"}/>
            </div>
        </DescriptionOnHover>
    }

}

export default InfoPanel