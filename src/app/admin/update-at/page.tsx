"use client"


import {allRecords, deleteAllRecords, updateEverything} from "../../../actions/atproto-update";
import {deleteTopicVersionsForUser} from "../../../actions/topics";
import React from "react";
import {BasicButton} from "../../../components/ui-utils/basic-button";
import {setRkeys} from "../../../actions/admin";

const Page = () => {
    return <div className={"w-screen flex flex-col items-center space-y-4"}>
        <h1>Sync con ATProto</h1>

        <BasicButton onClick={async () => {
            await updateEverything(false)
        }}>
            Actualizar todo
        </BasicButton>

        <BasicButton onClick={async () => {
            await updateEverything(true)
        }}>
            Actualizar todo reemplazando
        </BasicButton>

        <BasicButton onClick={async () => {
            await deleteTopicVersionsForUser()
        }}>
            Eliminar temas
        </BasicButton>


        <BasicButton onClick={async () => {
            await allRecords()
        }}>
            All records
        </BasicButton>

        <BasicButton onClick={async () => {
            await setRkeys()
        }}>
            Set rkeys
        </BasicButton>

        <BasicButton onClick={async () => {
            await deleteAllRecords()
        }}>
            Eliminar todos los records
        </BasicButton>
    </div>
}


export default Page