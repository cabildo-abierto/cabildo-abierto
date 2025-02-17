import {ReactNode} from "react";

export const NoResults = ({text="No se encontraron resultados..."}: {text?: ReactNode}) => {
    return <div className="text-center text-sm max-w-128 text-[var(--text-light)] mt-8">{text}</div>
}