"use client"
import React, {useState} from "react";
import { AdminSection } from "./admin-section";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {ListEditor} from "../../../modules/ui-utils/src/list-editor";
import {collectionsList} from "@/components/admin/acceso";
import {post} from "@/utils/fetch";
import {categoriesSearchParam} from "@/queries/api";


export const AdminSync = () => {
    const [collections, setCollections] = useState<string[]>([])

    async function syncAllUsers(collections: string[]){
        await post("/sync-all-users?"+categoriesSearchParam(collections))
    }

    return <div className={"flex flex-col items-center mt-8 space-y-8 mb-64"}>
        <div>
            <ListEditor
                newItemText={"collection"}
                items={collections}
                setItems={setCollections}
                options={collectionsList}
            />
        </div>
        <AdminSection title={"Usuarios"}>
            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Sync all"}
                handleClick={async () => {
                    await syncAllUsers(collections)
                    return {}
                }}
            />
        </AdminSection>
    </div>
}