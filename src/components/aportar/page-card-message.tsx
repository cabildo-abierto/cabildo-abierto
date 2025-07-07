import {ReactNode} from "react";


export const PageCardMessage = ({title, content}: { title: ReactNode, content: ReactNode }) => {
    return <div className={"mt-24"}>
        <div className="border rounded-lg p-4 text-sm sm:text-base sm:p-8 max-w-[600px] mx-4 space-y-4">
            <h3>{title}</h3>
            <div className="link text-[var(--text-light)]">
                {content}
            </div>
        </div>
    </div>
}