"use client"
import {ReactNode, useEffect, useState} from "react";
import {useSession} from "@/queries/useSession";
import {AcceptButtonPanel} from "../../../modules/ui-utils/src/accept-button-panel";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session} from "@/lib/types";
import {produce} from "immer";


export default function PopupMessage({children}: {children: ReactNode}) {
    const {user} = useSession()
    const [popupState, setPopupState] = useState("not opened")
    const qc = useQueryClient()

    useEffect(() => {
        const showAuthorTutorial = user && user.authorStatus && user.authorStatus.isAuthor && !user.authorStatus.seenAuthorTutorial

        if(showAuthorTutorial && popupState == "not opened"){
            setPopupState("open")
        }

        if(showAuthorTutorial && popupState == "closed"){
            post<{}, {}>("/seen-tutorial/panel-de-autor")
            setPopupState("sent seen tutorial")
            qc.setQueryData(["session"], old => {
                return produce(old as Session, draft => {
                    draft.authorStatus = {
                        isAuthor: true,
                        seenAuthorTutorial: true
                    }
                })
            })
        }

    }, [user, popupState])

    return <div>
        {children}
        {popupState == "open" && <AcceptButtonPanel
            open={true}
            onClose={()=>{setPopupState("closed")}}
        >
            <div className={"text-center max-w-[500px] p-1 sm:p-8 text-[var(--text-light)] space-y-2"}>
                <h2>
                    ¡Gracias por contribuir a la discusión!
                </h2>
                <div>
                    En el <span className={"font-bold"}>Panel de autor</span> que se abre desde la barra lateral vas a encontrar tus artículos y ediciones de temas, con estadísticas de lectura y tus ingresos asociados a cada publicación.
                </div>
            </div>
        </AcceptButtonPanel>
        }
    </div>
}