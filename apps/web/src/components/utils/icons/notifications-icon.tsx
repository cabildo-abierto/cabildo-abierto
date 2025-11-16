import {useState} from 'react';
import {BellIcon} from "@phosphor-icons/react";


const NotificationsIcon = ({
                               count,
                               weight = "regular",
                               color = "var(--text)",
                               fontSize = 24
                           }: {
    count?: number
    color?: string
    weight?: "regular" | "fill" | "light"
    fontSize?: number
}) => {
    const [clicked, setClicked] = useState(false)

    return <div
        className="relative flex"
        onClick={() => {
            setClicked(true)
        }}
    >
        <BellIcon
            weight={weight}
            fontSize={fontSize}
            color={color}
        />
        {(count && !clicked && count > 0) ?
            <span
                className={"font-bold absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center"}
            >
            {count}
          </span> : <></>
        }
    </div>
}


export default NotificationsIcon