import React, {ReactNode} from "react";


export const EngagementIconWithCounter = ({
                                              iconActive,
                                              iconInactive,
                                              count,
                                              active,
                                              hideZero=false,
                                              textClassName
                                          }: {
    iconActive: ReactNode
    iconInactive: ReactNode
    count: number
    active: boolean
    hideZero?: boolean
    textClassName?: string
}) => {
    return <div className="flex items-center space-x-1 text-[var(--text-light)]">
        {active ? <div>{iconActive}</div> : <div>{iconInactive}</div>}
        {(count > 0 || !hideZero) && <div className={textClassName}>
            {count}
        </div>}
    </div>
}