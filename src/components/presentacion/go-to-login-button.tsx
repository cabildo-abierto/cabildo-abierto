"use client"
import {Button} from "../../../modules/ui-utils/src/button";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/useSession";
import {useRouter, useSearchParams} from "next/navigation";
import {useMediaQuery} from "@mui/system";
import { Color } from "../../../modules/ui-utils/src/color";


export const GoToLoginButton = ({fontSize = 13, color="background-dark", className = "font-bold", text = "Crear una cuenta o iniciar sesión"}: {
    className?: string, fontSize?: number, text?: string,
    color?: Color
}) => {
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    const router = useRouter()
    const isMobile = useMediaQuery('(max-width:600px)')
    const params = useSearchParams()

    const code = params.get("c")

    return <>
        <Button
            color={color}
            variant={"outlined"}
            size={!isMobile ? "large" : "medium"}
            onClick={() => {
                if(user) {
                    router.push("/inicio")
                } else {
                    setLoginModalOpen(true)
                }
            }}
        >
            <div className={"flex flex-col"}>
            {code && <div className={"text-[11px] flex items-center space-x-2 justify-center"} style={{textTransform: "none"}}>
                <span>¡Recibiste un código de invitación!</span>
            </div>}
            <div className={className} style={{fontSize}}>{text}</div>
            </div>
        </Button>
    </>
}

