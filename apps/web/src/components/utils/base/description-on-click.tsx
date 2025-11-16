import {ReactNode} from "react";
import Link from "next/link";
import {ModalOnClick} from "./modal-on-click";


export const DescriptionOnClick = ({children, description, moreInfoHref}: {
    children: ReactNode, description: ReactNode, moreInfoHref?: string
}) => {

    const modal = (close: () => void) => {
        return <div
            onClick={e => {
                e.stopPropagation()
            }}
            className={"max-w-[300px] z-[1002] text-sm"}
        >
            {description} {moreInfoHref && <Link
            href={moreInfoHref}
            onClick={e => e.stopPropagation()}
            className={"hover:underline text-[var(--text-light)]"}
        >
            Más información.
        </Link>}
        </div>
    }

    if (!description) return children

    return <ModalOnClick modal={modal}>
        {children}
    </ModalOnClick>
}