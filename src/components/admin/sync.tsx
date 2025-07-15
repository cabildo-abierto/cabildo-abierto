"use client"
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {ListEditor} from "../../../modules/ui-utils/src/list-editor";
import {collectionsList} from "@/components/admin/acceso";
import {post} from "@/utils/fetch";
import {categoriesSearchParam, useUsersSyncStatus} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {listOrderDesc, sortByKey} from "@/utils/arrays";
import { Button } from "../../../modules/ui-utils/src/button";


export const AdminSync = () => {
    const [collections, setCollections] = useState<string[]>([])
    const {data: syncData, refetch, isLoading} = useUsersSyncStatus()

    async function syncAllUsers(collections: string[]) {
        await post("/sync-all-users?" + categoriesSearchParam(collections))
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

            {isLoading && <LoadingSpinner/>}

            <Button onClick={async () => {await refetch()}}>
                Refetch
            </Button>

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
                            {u.mirrorStatus != "Sync" && <StateButton
                                handleClick={async () => {
                                    await post(`/sync-user/${u.did}`)
                                    return {}
                                }}
                                text1={"Sync"}
                            />}
                        </td>
                    </tr>
                })}
                </tbody>
            </table>
            }

        </AdminSection>
    </div>
}