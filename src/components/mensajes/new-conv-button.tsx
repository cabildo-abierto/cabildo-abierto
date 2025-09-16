import React, {useState} from "react";
import {Button} from "../../../modules/ui-utils/src/button";
import AddIcon from "@mui/icons-material/Add";
import dynamic from "next/dynamic";

const CreateConvPanel = dynamic(() => import("@/components/mensajes/create-conv-panel"), {
    ssr: false
})

export default function NewConvButton() {
    const [creatingConv, setCreatingConv] = useState<boolean>(false)
    return <>
        <Button
            startIcon={<AddIcon/>}
            size={"small"}
            onClick={() => {
                setCreatingConv(true)
            }}
            borderColor={"text-light"}
            variant={"outlined"}
            color={"transparent"}
            sx={{
                borderRadius: 0,
            }}
        >
            <span className={"uppercase text-[11px] py-[2px] font-semibold"}>Nueva conversación</span>
        </Button>

        {creatingConv && <CreateConvPanel open={creatingConv} onClose={() => {
            setCreatingConv(false)
        }}/>}
    </>
}