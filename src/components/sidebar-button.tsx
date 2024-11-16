import { Button } from "@mui/material"
import Link from "next/link"
import { ReactNode } from "react"

type SidebarButtonProps = {
    text: string
    onClick: () => void
    icon: ReactNode
    href: string
    disabled?: boolean
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({text, onClick, icon, href, disabled=false}) => {

    return (
        <Link href={href} className="mt-1">
            <Button
                variant="text"
                color="inherit"
                size="large"
                sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',  // Align icon and text to the left
                    paddingLeft: 2,                // Optional: add padding to the left to give space
                }}
                onClick={onClick}
                startIcon={icon}
                fullWidth
                disabled={disabled}
            >
                {text}
            </Button>
        </Link>
    )
}
