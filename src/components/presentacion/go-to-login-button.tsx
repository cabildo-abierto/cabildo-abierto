"use client"
import {Button} from "../../../modules/ui-utils/src/button";
import {isMobile} from "react-device-detect";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/useSession";
import {useRouter} from "next/navigation";


export const GoToLoginButton = ({fontSize = 13, className = "font-bold", text = "Crear una cuenta o iniciar sesión"}: {
    className?: string, fontSize?: number, text?: string
}) => {
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    const router = useRouter()

    return <>
        <Button
            color={"transparent"}
            variant={"outlined"}
            size={!isMobile ? "large" : "medium"}
            textTransform={""}
            sx={{
                borderRadius: 0,
                borderColor: "var(--text)"
            }}

            onClick={() => {
                if(user) {
                    router.push("/inicio")
                } else {
                    setLoginModalOpen(true)
                }
            }}
        >
            <span className={className} style={{fontSize}}>{text}</span>
        </Button>
    </>
}

