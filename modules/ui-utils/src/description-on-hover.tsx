import {ReactNode} from "react";
import {ModalOnHover} from "./modal-on-hover";
import Link from "next/link";


const DescriptionOnHover = ({children, description, moreInfoHref}: {
    children: ReactNode, description: ReactNode, moreInfoHref?: string
}) => {

    const modal = <div onClick={e => {e.stopPropagation()}} className={"max-w-[300px] bg-[var(--background-dark)] shadow-xl border border-[var(--text)] rounded px-2 py-1 text-sm"}>
        {description} {moreInfoHref && <Link href={moreInfoHref} onClick={e => e.stopPropagation()} className={"hover:underline text-[var(--text-light)]"}>Más información.</Link>}
    </div>

    if(!description) return children

    return <ModalOnHover modal={modal}>
        {children}
    </ModalOnHover>
}


export default DescriptionOnHover