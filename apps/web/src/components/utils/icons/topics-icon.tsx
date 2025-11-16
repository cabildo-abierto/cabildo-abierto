import {HashStraightIcon} from "@phosphor-icons/react";


export default function TopicsIcon({fontSize=22, weight, color="var(--text)"}: {
    outlined?: boolean
    fontSize?: number
    weight?: "light" | "fill" | "regular" | "bold"
    color?: string
}) {
    return <HashStraightIcon weight={weight} fontSize={fontSize} color={color}/>
}