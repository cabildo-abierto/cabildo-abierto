import Link, {LinkProps} from "next/link"
import {ReactNode} from "react";

type Props = LinkProps & {
    className?: string
    children: ReactNode
    target?: string
}

export const dimOnHoverClassName = "hover:brightness-75 hover:opacity-75 transition duration-200 "

export const DimOnHoverLink = ({children, target, className="", ...props}: Props) => {
    return <Link className={dimOnHoverClassName + className} target={target} {...props}>
        {children}
    </Link>
}