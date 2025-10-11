import React, {useState} from "react";
import {Button} from "../layout/utils/button";
import AddIcon from "@mui/icons-material/Add";
import dynamic from "next/dynamic";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/getters/useSession";

const CreateConvPanel = dynamic(() => import("@/components/mensajes/create-conv-panel"), {
    ssr: false
})

export default function NewConvButton() {
    const [creatingConv, setCreatingConv] = useState<boolean>(false)
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    return <>
        <Button
            startIcon={<AddIcon/>}
            size={"small"}
            onClick={() => {
                if(user) {
                    setCreatingConv(true)
                } else {
                    setLoginModalOpen(true)
                }
            }}
            borderColor={"text-light"}
            variant={"outlined"}
            color={"transparent"}
            sx={{
                borderRadius: 0,
            }}
        >
            <span className={"uppercase text-[11px] py-[2px] font-semibold"}>
                Nueva conversación
            </span>
        </Button>

        {creatingConv && <CreateConvPanel open={creatingConv} onClose={() => {
            setCreatingConv(false)
        }}/>}
    </>
}