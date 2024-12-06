import { Button } from "@mui/material"
import { ReactNode } from "react"
import { CustomLink } from "./custom-link"

type SidebarButtonProps = {
    text: string
    onClick: () => void
    icon: ReactNode
    href: string
    disabled?: boolean
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({text, onClick, icon, href, disabled=false}) => {

    return (
        <CustomLink href={href} className="mt-1">
            <Button
                variant="text"
                color="inherit"
                size="large"
                sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    paddingLeft: 2,
                }}
                onClick={onClick}
                startIcon={icon}
                fullWidth
                disabled={disabled}
            >
                {text}
            </Button>
        </CustomLink>
    )
}
