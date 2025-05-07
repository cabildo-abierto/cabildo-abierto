import {ReactNode} from "react";


export const PageCardMessage = ({title, content}: { title: ReactNode, content: ReactNode }) => {
    return <div>
        <div className="border rounded-lg p-8 max-w-[600px] space-y-4">
            <h3>{title}</h3>
            <div className="link text-justify text-[var(--text-light)]">
                {content}
            </div>
        </div>
    </div>
}