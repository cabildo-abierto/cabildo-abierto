import {ReactNode} from "react";


export const FeedEndText = ({text}: {text: ReactNode}) => {
    return <div className={"text-center font-light py-16 text-[var(--text-light)] text-sm"}>
        {text}
    </div>
}