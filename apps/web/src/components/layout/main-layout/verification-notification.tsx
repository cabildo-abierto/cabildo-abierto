"use client"
import {ReactNode, useEffect, useState} from "react";
import {useSession} from "@/components/auth/use-session";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import ValidationIcon from "../../perfil/validation-icon";
import {Note} from "@/components/utils/base/note";
import {post} from "../../utils/react/fetch";


export const VerificationNotification = ({children}: {children: ReactNode}) => {
    const {user, refetch} = useSession()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if(!open && user && user.validation && user.validation != "none" && !user.seenVerifiedNotification){
            setOpen(true)
        }
    }, [user])

    async function onClose() {
        const res = await post("/seen-tutorial/verification")
        setOpen(false)
        await refetch()
        return {error: res.success === false ? res.error : undefined}
    }

    return <>
        {open && <AcceptButtonPanel
            onClose={onClose}
            open={open}>
            <div className={"flex flex-col items-center text-center space-y-2"}>
                <div>
                    <ValidationIcon fontSize={64} verification={user.validation}/>
                </div>
                <h3>
                    ¡Tu cuenta ya está verificada!
                </h3>
                {user.validation == "persona" && <Note className={"max-w-[400px]"}>
                    Pudimos verificar tu cuenta personal. Ya tenés la marca en tu perfil.
                </Note>}
                {user.validation == "persona" && <Note className={"max-w-[400px]"}>
                    Además, a partir de ahora se va a remunerar a los autores que leas, aumentó tu nivel de permisos en la edición de temas y se te va a priorizar en las discusiones.
                </Note>}
                {user.validation == "org" && <Note className={"max-w-[400px]"}>
                    Pudimos verificar tu cuenta de organización. Otros usuarios ya pueden ver la marca en tu perfil.
                </Note>}
            </div>
        </AcceptButtonPanel>}
        {children}
    </>
}