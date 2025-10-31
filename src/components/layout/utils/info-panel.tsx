import {ReactNode} from 'react';
import DescriptionOnHover from "./description-on-hover";
import DescriptionOnClick from "./description-on-click";
import {InfoIcon} from "@phosphor-icons/react";
import {useIsMobile} from "@/components/layout/utils/use-is-mobile";

export const InfoPanel = ({
                              text,
                              onClick,
                              moreInfoHref,
    iconFontSize=20
                          }: {
    text?: ReactNode,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
    moreInfoHref?: string
    iconFontSize?: number
}) => {
    const {isMobile} = useIsMobile()

    if (isMobile) {
        return <DescriptionOnClick description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize={iconFontSize} weight={"regular"}/>
            </div>
        </DescriptionOnClick>
    } else {
        return <DescriptionOnHover description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer"} onClick={onClick}>
                <InfoIcon fontSize={iconFontSize} weight={"regular"}/>
            </div>
        </DescriptionOnHover>
    }

}

export default InfoPanel