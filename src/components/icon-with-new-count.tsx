import { ReactNode, useState } from "react"



export const IconWithNewCount = ({count, icon}: {count: number, icon: ReactNode}) => {

    const className = "font-bold absolute top-0 right-0 transform \
    translate-x-1/2 -translate-y-1/2 bg-red-500 text-white\
     rounded-full text-xs w-4 h-4 flex items-center justify-center"

    return <div className="relative flex">
        {icon}
        {(count && count > 0) ?
          <span className={className}>
            {count}
          </span> : <></>
        }
    </div>
}

