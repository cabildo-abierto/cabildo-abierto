import React, {useState} from "react";
import {BaseButton} from "../layout/base/baseButton";
import dynamic from "next/dynamic";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/getters/useSession";
import {PlusIcon} from "@phosphor-icons/react";

const CreateConvPanel = dynamic(() => import("@/components/mensajes/create-conv-panel"), {
    ssr: false
})

export default function NewConvButton() {
    const [creatingConv, setCreatingConv] = useState<boolean>(false)
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    return <>
        <BaseButton
            startIcon={<PlusIcon/>}
            size={"small"}
            onClick={() => {
                if(user) {
                    setCreatingConv(true)
                } else {
                    setLoginModalOpen(true)
                }
            }}
            variant={"outlined"}
        >
            <span className={"uppercase text-[11px] py-[2px] font-semibold"}>
                Nueva conversación
            </span>
        </BaseButton>

        {creatingConv && <CreateConvPanel open={creatingConv} onClose={() => {
            setCreatingConv(false)
        }}/>}
    </>
}