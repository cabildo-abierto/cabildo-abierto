import React, {useState} from "react";
import {Button} from "../../../modules/ui-utils/src/button";
import { TrashIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
const DeleteAccountModal = dynamic(() => import("./delete-account-modal"))


export const DeleteAccountButton = () => {
    const [deletingAccount, setDeletingAccount] = useState<boolean>(false)


    return <div>
        <Button
            color={"background-dark"}
            startIcon={<TrashIcon/>}
            onClick={() => {setDeletingAccount(true)}}
            borderColor={"accent-dark"}
            variant={"outlined"}
        >
            Borrar cuenta
        </Button>
        {deletingAccount && <DeleteAccountModal
            open={deletingAccount}
            onClose={() => {setDeletingAccount(false)}}
        />}
    </div>
}