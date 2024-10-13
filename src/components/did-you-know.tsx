import { ReactNode } from "react";



export const DidYouKnow = ({text}: {text: ReactNode}) => {
    return <div className="flex justify-center py-2">
        <div className="content-container w-72 text-sm text-center p-1 text-[var(--text-light)]">
            {text}
        </div>
    </div>
}