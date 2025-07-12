import {ReactNode} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { ModalOnHover } from './modal-on-hover';
import DescriptionOnHover from "./description-on-hover";

export const InfoPanel = ({text, className, onClick, iconClassName = "text-gray-600", icon = <InfoIcon fontSize="small"/>}: {
    text?: ReactNode,
    className?: string,
    iconClassName?: string,
    icon?: ReactNode
    onClick?: () => void
}) => {

    const modal = text && (
        <div
            className={"z-10020 text-justify text-sm bg-[var(--background-dark)] rounded  border content-container " + (className ? className : "w-72")}
        >
            <div className="p-2">
                {text}
            </div>
        </div>
    )

    return <DescriptionOnHover description={modal}>
        <div className={"cursor-pointer " + iconClassName} onClick={onClick}>
            {icon}
        </div>
    </DescriptionOnHover>
};

export default InfoPanel