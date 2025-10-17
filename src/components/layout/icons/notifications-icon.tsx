import {useState} from 'react';
import {BellIcon} from "@phosphor-icons/react";
import {Color} from '../utils/color';

const NotificationsIcon = ({
                               count,
                               active = true,
                               weight = "regular",
                               color = "text",
    fontSize = 24
                           }: {
    count?: number
    active?: boolean
    color?: Color
    weight?: "regular" | "fill" | "light"
    fontSize?: number
}) => {
    const [clicked, setClicked] = useState(false)

    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex" onClick={() => {
        setClicked(true)
    }}>
        <BellIcon
            weight={active ? "fill" : weight}
            fontSize={fontSize}
            color={`var(--${color})`}/>
        {(count && !clicked && count > 0) ?
            <span className={className}>
            {count}
          </span> : <></>
        }
    </div>
}


export default NotificationsIcon