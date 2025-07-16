import {HashIcon} from "@phosphor-icons/react";


export default function TopicsIcon({outlined=false, fontSize=22}: {outlined?: boolean, fontSize?: number}) {
    return <HashIcon weight={outlined ? "regular" : "bold"} fontSize={fontSize}/>
}