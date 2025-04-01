import { Button } from "@mui/material"
import Link from "next/link"
import { ReactNode } from "react"
import { BaseFullscreenPopup } from "../../../modules/ui-utils/src/base-fullscreen-popup"



export const NeedAccountPopup = ({open, onClose, text}: {text: ReactNode, open: boolean, onClose: () => void}) => {
    return <BaseFullscreenPopup open={open}>
        <div className="py-6 sm:text-lg text-base text-center px-2">{text}</div>
        <div className="flex justify-center items-center space-x-4 px-6 pb-4 text-sm sm:text-base">
            <Button variant="contained" disableElevation={true} sx={{textTransform: "none"}} onClick={onClose}>
                Seguir leyendo
            </Button>
            <Link href="/public">
                <Button variant="contained" disableElevation={true} sx={{textTransform: "none"}}>
                    Crear una cuenta o iniciar sesión
                </Button>
            </Link>
        </div>
    </BaseFullscreenPopup>
}