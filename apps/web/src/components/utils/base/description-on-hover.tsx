import {ReactNode} from "react";
import {ModalOnHover} from "./modal-on-hover";
import Link from "next/link";


export const DescriptionOnHover = ({
                                       children,
                                       description,
                                       moreInfoHref
}: {
    children: ReactNode
    description: ReactNode
    moreInfoHref?: string
}) => {

    const modal = <div
        onClick={e => {
            e.stopPropagation()
        }}
        className={""}
    >
        {description} {moreInfoHref && <Link
        href={moreInfoHref}
        onClick={e => e.stopPropagation()}
        className={"hover:underline text-[var(--text-light)]"}>Más información.</Link>}
    </div>

    if (!description) return children

    return <ModalOnHover modal={modal}>
        {children}
    </ModalOnHover>
}