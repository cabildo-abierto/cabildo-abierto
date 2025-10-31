"use client"
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import StateButton from "../layout/utils/state-button";
import {ListEditor} from "../layout/utils/list-editor";
import {collectionsList} from "@/components/admin/acceso";
import {post} from "@/utils/fetch";
import {categoriesSearchParam} from "@/queries/utils";
import LoadingSpinner from "../layout/base/loading-spinner";
import {DateSince} from "../layout/utils/date";
import {listOrderDesc, sortByKey} from "@/utils/arrays";
import { BaseButton } from "../layout/base/baseButton";
import {useUsersSyncStatus} from "@/queries/getters/admin";


export const AdminSync = () => {
    const [collections, setCollections] = useState<string[]>([])
    const {data: syncData, refetch, isLoading} = useUsersSyncStatus()
    const [onlyRecords, setOnlyRecords] = useState(false)

    async function syncAllUsers(collections: string[]) {
        await post("/sync-all-users?" + categoriesSearchParam(collections))
    }

    return <div className={"flex flex-col items-center mt-8 space-y-8 mb-64"}>
        <div className={"bg-[var(--background-dark)] p-4"}>
            <div>
                Elegir collections
            </div>
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
                handleClick={async () => {
                    await syncAllUsers(collections)
                    return {}
                }}
            >
                Sync all
            </StateButton>

            {isLoading && <LoadingSpinner/>}

            <BaseButton onClick={async () => {await refetch()}}>
                Refetch
            </BaseButton>

            {syncData && <table className={""}>
                <tbody>
                {sortByKey(syncData, u => [new Date(u.CAProfile?.createdAt).getTime() ?? 0], listOrderDesc).map(u => {
                    return <tr key={u.did}>
                        <td>@{u.handle ?? u.did}</td>
                        <td>
                            <DateSince date={u.CAProfile?.createdAt}/>
                        </td>
                        <td>
                        {u.mirrorStatus}
                        </td>
                        <td>
                            <StateButton
                                handleClick={async () => {
                                    await post(`/sync-user/${u.did}` + (collections.length > 0 ? `?${categoriesSearchParam(collections)}` : ""))
                                    return {}
                                }}
                                variant={u.mirrorStatus == "Sync" ? "outlined" : "error"}
                            >
                                {u.mirrorStatus == "Sync" ? "Resync" : "Sync"}
                            </StateButton>
                        </td>
                    </tr>
                })}
                </tbody>
            </table>
            }

        </AdminSection>

        <AdminSection title={"Collections"}>
            <div className={"space-y-4 flex flex-col items-center"}>
                <BaseButton onClick={() => {setOnlyRecords(!onlyRecords)}}>{onlyRecords ? "Solo records" : "Completo"}</BaseButton>
                <StateButton
                    handleClick={async () => {
                        if(collections.length == 1) {
                            const {error} = await post("/job/reprocess-collection", {jobData: {
                                collection: collections[0],
                                onlyRecords
                            }})
                            return {error}
                        } else {
                            return {error: "Seleccioná una collection"}
                        }
                    }}
                >
                    Reprocesar collection
                </StateButton>
            </div>
        </AdminSection>
    </div>
}