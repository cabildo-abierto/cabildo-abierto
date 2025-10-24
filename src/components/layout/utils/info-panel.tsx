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
                              color = "text-light",
    iconFontSize=20
                          }: {
    text?: ReactNode,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
    moreInfoHref?: string
    color?: Color
    iconFontSize?: number
}) => {
    const {isMobile} = useLayoutConfig()

    if (isMobile) {
        return <DescriptionOnClick description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize={iconFontSize} color={`var(--${color}`} weight={"regular"}/>
            </div>
        </DescriptionOnClick>
    } else {
        return <DescriptionOnHover description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize={iconFontSize} color={`var(--${color}`} weight={"regular"}/>
            </div>
        </DescriptionOnHover>
    }

}

export default InfoPanel