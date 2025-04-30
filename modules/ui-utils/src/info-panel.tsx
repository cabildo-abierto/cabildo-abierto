import {ReactNode} from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { ModalOnHover } from './modal-on-hover';

export const InfoPanel = ({text, className, iconClassName = "text-gray-600", icon = <InfoIcon fontSize="small"/>}: {
    text: ReactNode,
    className?: string,
    iconClassName?: string,
    icon?: ReactNode
}) => {

    const modal = (
        <div
            className={"z-10020 text-justify text-sm bg-[var(--background-dark)] rounded  border content-container " + (className ? className : "w-72")}
        >
            <div className="p-2">
                {text}
            </div>
        </div>
    )

    return <ModalOnHover modal={modal}>
        <div className={"cursor-pointer " + iconClassName}>
            {icon}
        </div>
    </ModalOnHover>
};

export default InfoPanel