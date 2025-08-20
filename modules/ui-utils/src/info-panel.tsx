import {ReactNode} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionOnHover from "./description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import DescriptionOnClick from "./description-on-click";

export const InfoPanel = ({
                              text,
                              className,
                              onClick,
                              iconClassName = "text-gray-600",
                              moreInfoHref,
                              icon = <InfoIcon fontSize="small"/>
                          }: {
    text?: ReactNode,
    className?: string,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
    moreInfoHref?: string
}) => {
    const {isMobile} = useLayoutConfig()

    if(isMobile){
        return <DescriptionOnClick description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer " + iconClassName} onClick={onClick}>
                {icon}
            </div>
        </DescriptionOnClick>
    } else {
        return <DescriptionOnHover description={text} moreInfoHref={moreInfoHref}>
            <div className={"cursor-pointer " + iconClassName} onClick={onClick}>
                {icon}
            </div>
        </DescriptionOnHover>
    }

}

export default InfoPanel