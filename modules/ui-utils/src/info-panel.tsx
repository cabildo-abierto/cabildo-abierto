import {ReactNode} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionOnHover from "./description-on-hover";

export const InfoPanel = ({text, className, onClick, iconClassName = "text-gray-600", icon = <InfoIcon fontSize="small"/>}: {
    text?: ReactNode,
    className?: string,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
}) => {

    return <DescriptionOnHover description={text}>
        <div className={"cursor-pointer " + iconClassName} onClick={onClick}>
            {icon}
        </div>
    </DescriptionOnHover>
};

export default InfoPanel