import {ReactNode} from "react";

export const NoResults = ({text="No se encontraron resultados..."}: {text?: ReactNode}) => {
    return <div className="text-center max-w-128 text-[var(--text-light)] my-4">{text}</div>
}