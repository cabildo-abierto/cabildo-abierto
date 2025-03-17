import {Button, IconButton} from "@mui/material"
import { ReactNode } from "react"
import { CustomLink } from "../ui-utils/custom-link"

type SidebarButtonProps = {
    text: string
    onClick: () => void
    icon: ReactNode
    iconInactive?: ReactNode
    href: string
    disabled?: boolean
    selected?: boolean
    showText: boolean
    setShowText: (showText: boolean) => void
}

export const SidebarButton = ({
  showText, text, onClick, icon, iconInactive, href, disabled=false, selected=false
}: SidebarButtonProps) => {

    return <>
        <CustomLink href={href} className="mt-1 h-10">
            {showText ? <Button
                variant="text"
                color="inherit"
                size="large"
                sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    paddingLeft: 2,
                }}
                onClick={onClick}
                fullWidth
                disabled={disabled}
            >
                <div className={"flex items-center space-x-2"}>
                {selected || !iconInactive ? icon : iconInactive} <span className={selected ? "font-bold" : ""}>{showText ? text : ""}</span>
                </div>
            </Button> :
            <Button
                color={"inherit"}
                variant={"text"}
                size={"large"}
            >
                {selected || !iconInactive ? icon : iconInactive}
            </Button>
            }
        </CustomLink>
    </>
}
