import { HouseLineIcon } from '@phosphor-icons/react';

const HomeIcon = ({fontSize=24, color, weight="light"}: {
    fontSize?: number
    color?: string
    weight?: "fill" | "light"
}) => {
    return <HouseLineIcon weight={weight} fontSize={fontSize} color={color}/>
}


export default HomeIcon;