import React, {useState} from "react";
import {BaseButton} from "../../layout/base/baseButton";
import { TrashIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
const DeleteAccountModal = dynamic(() => import("./delete-account-modal"))


export const DeleteAccountButton = () => {
    const [deletingAccount, setDeletingAccount] = useState<boolean>(false)


    return <div>
        <BaseButton
            startIcon={<TrashIcon/>}
            onClick={() => {setDeletingAccount(true)}}
            variant={"outlined"}
            className={"bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)]"}
        >
            Borrar cuenta
        </BaseButton>
        {deletingAccount && <DeleteAccountModal
            open={deletingAccount}
            onClose={() => {setDeletingAccount(false)}}
        />}
    </div>
}