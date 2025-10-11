import { HouseLineIcon } from '@phosphor-icons/react';
import { Color } from '../../../../modules/ui-utils/src/color';

const HomeIcon = ({fontSize=24, color, weight="light"}: {
    fontSize?: number
    color?: Color
    weight: "fill" | "light"
}) => {
    return <HouseLineIcon weight={weight} fontSize={fontSize} color={color}/>
}


export default HomeIcon;