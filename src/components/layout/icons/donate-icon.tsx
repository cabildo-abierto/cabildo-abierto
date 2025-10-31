import { FontSizeType } from './icon-utils';
import {HandCoinsIcon} from "@phosphor-icons/react";

const DonateIcon = ({fontSize, color}: {fontSize?: FontSizeType, color?: "inherit"}) => {
    return <HandCoinsIcon fontSize={fontSize} color={color}/>
}

export default DonateIcon