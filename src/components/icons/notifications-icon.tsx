
import NotificationsIconMui from '@mui/icons-material/Notifications';
import { useState } from 'react';

export const NotificationsIcon = ({ count }: { count?: number }) => {
    const [clicked, setClicked] = useState(false)

    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"
    return <div className="relative flex" onClick={() => {setClicked(true)}}>
        <NotificationsIconMui />
        {(count && !clicked && count > 0) ?
          <span className={className}>
            {count}
          </span> : <></>
        }
    </div>
}