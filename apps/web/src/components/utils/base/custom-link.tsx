import {useRouter} from "next/navigation";
import Link from "next/link";
import {ReactNode} from "react";
import * as React from "react";

type LinkEvent = React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLSpanElement>

type CustomLinkProps = {
    href?: string;
    children: ReactNode;
    className?: string
    target?: "_blank" | undefined
    rel?: string
    onMouseEnter?: any
    onMouseLeave?: any
    draggable?: boolean
    style?: any
    title?: string
    id?: string
    onClick?: (e : LinkEvent) => Awaited<void>
    tag?: "div" | "span" | "link"
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
                               title,
                               tag = "link",
                           }: CustomLinkProps) {
    const router = useRouter()

    function redirect(e: LinkEvent) {
        if(!href) return
        if(target == "_blank" || e.metaKey || e.ctrlKey){
            window.open(href, "_blank")
        } else {
            router.push(href)
        }
    }

    function handleClick(e: LinkEvent) {
        e.stopPropagation()
        e.preventDefault()
        redirect(e)
        onClick?.(e)
    }

    if(onClick || href){
        className += " cursor-pointer"
    }

    if (tag == "span") {
        return <span
            className={className}
            onClick={handleClick}
            title={title}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            draggable={draggable}
            style={style}
            id={id}
            role={"link"}
            tabIndex={0}
        >
            {children}
        </span>
    } else if(tag == "div" || !href){
        return <div
            className={className}
            onClick={handleClick}
            title={title}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            draggable={draggable}
            style={style}
            id={id}
            role={"link"}
            tabIndex={0}
        >
            {children}
        </div>
    } else {
        return <Link
            className={className}
            onClick={handleClick}
            href={href}
            title={title}
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
    }
}
