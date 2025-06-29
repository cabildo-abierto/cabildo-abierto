"use client"
import {useRouter} from "next/navigation";
import Link, {LinkProps} from 'next/link'
import {usePageLeave} from "./prevent-leave";

type CustomLinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string
    target?: string
    rel?: string
    onMouseEnter?: any
    onMouseLeave?: any
    draggable?: boolean
    style?: any
    title?: string
    id?: string
    onClick?: LinkProps["onClick"]
};

export function CustomLink({
                               href,
                               children,
                               id,
                               onClick,
                               className,
                               target,
                               rel,
                               onMouseEnter,
                               onMouseLeave,
                               draggable,
                               style,
                               title
                           }: CustomLinkProps) {
    const {leaveStoppers} = usePageLeave()
    const router = useRouter()

    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (leaveStoppers.length > 0) {
            if (window.confirm("Hay cambios sin guardar. ¿Deseas salir de todas formas?")) {
                router.push(href)
            }
        }
        onClick?.(e)
    }

    if (!href && !onClick) {
        return <div
            className={className}
        >
            {children}
        </div>
    }

    return (
        <Link
            href={href}
            title={title}
            onClick={handleClick}
            className={className}
            target={target}
            rel={rel}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            draggable={draggable}
            style={style}
            id={id}
        >
            {children}
        </Link>
    );
}
