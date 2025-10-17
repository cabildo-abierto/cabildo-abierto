import {ReactNode} from "react";


export const PageCardMessage = ({title, content, className="p-4 sm:p-8"}: {
    title?: ReactNode,
    content: ReactNode,
    className?: string
}) => {
    return <div className={"mt-24 bg-[var(--background-dark)] text-sm sm:text-base max-w-[600px] mx-4 space-y-4 " + className}>
        {title && <h3 className={"text-center uppercase text-base"}>{title}</h3>}
        <div className="link text-[var(--text-light)]">
            {content}
        </div>
    </div>
}