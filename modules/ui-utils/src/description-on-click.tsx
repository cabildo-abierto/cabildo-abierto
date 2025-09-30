import {ReactNode} from "react";
import Link from "next/link";
import {ModalOnClick} from "./modal-on-click";


const DescriptionOnClick = ({children, description, moreInfoHref}: {
    children: ReactNode, description: ReactNode, moreInfoHref?: string
}) => {

    const modal = (close: () => void) => {
        return <div
            onClick={e => {
                e.stopPropagation()
            }}
            className={"max-w-[300px] panel-dark px-2 py-1 text-sm"}
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


export default DescriptionOnClick