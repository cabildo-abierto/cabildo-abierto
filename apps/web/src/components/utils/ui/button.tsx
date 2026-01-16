import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap tracking-[0.0167em] uppercase font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "group-[.portal]:hover:bg-[var(--background-dark2)] hover:bg-[var(--background-dark)]",
                outlined:
                    "border border-[var(--accent-dark)] hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] group-[.portal]:bg-[var(--background-dark2)] group-[.portal]:hover:bg-[var(--background-dark3)]",
                error:
                    "bg-[var(--red-dark)] hover:bg-[var(--red-dark2)] text-[var(--white-text)] border border-[var(--accent-dark)]",
                black: "bg-[var(--text)] group-[.portal]:hover:bg-[var(--text-light)] hover:bg-[var(--text-light)] text-[var(--background)] rounded-xl",
                white: "bg-[var(--background)] group-[.portal]:hover:bg-[var(--background-dark)] group-[.portal]:hover:bg-[var(--background-dark2)] hover:bg-[var(--background-dark)] text-[var(--text)] rounded-xl"
            },
            size: {
                default: "px-4 py-[8px] text-[13.5px] [&_svg]:size-4",
                small: "py-[6px] px-3 text-[11.6px] [&_svg]:size-[14px]",
                large: "py-[10px] px-8 text-[14.5px] [&_svg]:size-5",
                icon: "p-[5px]",
                "icon-lg": "p-[8px]",
                "icon-sm": "p-[5px]"
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        }
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({variant, size, className}))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export interface NotButtonProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const NotButton = React.forwardRef<HTMLDivElement, NotButtonProps>(
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : "div"
        return (
            <Comp
                className={cn(buttonVariants({variant, size, className}))}
                ref={ref}
                {...props}
            />
        )
    }
)
NotButton.displayName = "NotButton"

export {Button, NotButton, buttonVariants}
