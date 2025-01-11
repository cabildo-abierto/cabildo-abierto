import {Button, IconButton} from "@mui/material"
import { ReactNode } from "react"
import { CustomLink } from "./custom-link"

type SidebarButtonProps = {
    text: string
    onClick: () => void
    icon: ReactNode
    href: string
    disabled?: boolean
    selected?: boolean
    showText: boolean
    setShowText: (showText: boolean) => void
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({showText, setShowText, text, onClick, icon, href, disabled=false, selected=false}) => {

    return <>
        <CustomLink href={href} className="mt-1">
            {true ? <Button
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
                <span className={selected ? "font-bold" : "" + (showText ? "" : " text-transparent")}>{text}</span>
            </Button> :
            <IconButton
                color="inherit"
                sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    paddingLeft: 2,
                }}
                onClick={onClick}
                disabled={disabled}
            >
                {icon}
            </IconButton>
            }
        </CustomLink>
    </>
}
