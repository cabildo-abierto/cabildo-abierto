"use client"
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import {ListEditor} from "@/components/utils/base/list-editor";
import {collectionsList} from "./acceso";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {DateSince} from "@/components/utils/base/date";
import {listOrderDesc, sortByKey} from "@cabildo-abierto/utils/dist/arrays";
import {BaseButton} from "@/components/utils/base/base-button";
import {useUsersSyncStatus} from "@/queries/getters/admin";
import {StateButton} from "@/components/utils/base/state-button";
import {categoriesSearchParam} from "@/components/utils/react/queries";
import {post} from "@/components/utils/react/fetch";


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

            <BaseButton onClick={async () => {
                await refetch()
            }}>
                Refetch
            </BaseButton>

            {syncData && <table>
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
                <BaseButton onClick={() => {
                    setOnlyRecords(!onlyRecords)
                }}>
                    {onlyRecords ? "Solo records" : "Completo"}
                </BaseButton>
                <StateButton
                    handleClick={async () => {
                        if (collections.length == 1) {
                            const {error} = await post("/job/reprocess-collection", {
                                jobData: {
                                    collection: collections[0],
                                    onlyRecords
                                }
                            })
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