"use client"
import React, {useState} from "react";
import {AdminSection} from "./admin-section";
import {ListEditor} from "@/components/utils/base/list-editor";
import {collectionsList} from "./acceso";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {DateSince} from "@/components/utils/base/date";
import {sortByKey} from "@cabildo-abierto/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import {useUsersSyncStatus, UserSyncStatus} from "@/queries/getters/admin";
import {StateButton} from "@/components/utils/base/state-button";
import {categoriesSearchParam} from "@/components/utils/react/queries";
import {post} from "@/components/utils/react/fetch";


function SyncStatusBadge({status}: {status: string | null}) {
    const statusConfig: Record<string, {bg: string, text: string, label: string}> = {
        "Sync": {bg: "bg-green-800", text: "text-green-100", label: "Sync"},
        "InProcess": {bg: "bg-yellow-600", text: "text-yellow-100", label: "En proceso"},
        "Dirty": {bg: "bg-orange-600", text: "text-orange-100", label: "Dirty"},
        "Failed": {bg: "bg-red-700", text: "text-red-100", label: "Fallido"},
        "Failed - Too Large": {bg: "bg-red-900", text: "text-red-100", label: "Muy grande"},
    }
    
    const config = status ? statusConfig[status] : null
    
    if (!config) {
        return <span className="px-2 py-0.5 rounded text-xs bg-gray-600 text-gray-100">{status ?? "Desconocido"}</span>
    }
    
    return (
        <span className={`px-2 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    )
}


function UserSyncRow({user, collections, onSync}: {
    user: UserSyncStatus,
    collections: string[],
    onSync: () => void
}) {
    return (
        <tr className="border-b border-[var(--background-dark2)] hover:bg-[var(--background-dark2)]">
            <td className="py-2 px-3 text-sm">
                @{user.handle ?? user.did.slice(0, 20) + "..."}
            </td>
            <td className="py-2 px-3 text-sm text-[var(--text-light)]">
                {user.CAProfile?.createdAt ? <DateSince date={user.CAProfile.createdAt}/> : "-"}
            </td>
            <td className="py-2 px-3">
                <SyncStatusBadge status={user.mirrorStatus}/>
            </td>
            <td className="py-2 px-3">
                <StateButton
                    size={"small"}
                    handleClick={async () => {
                        await post(`/sync-user/${user.did}` + (collections.length > 0 ? `?${categoriesSearchParam(collections)}` : ""))
                        onSync()
                        return {}
                    }}
                    variant={user.mirrorStatus == "Sync" ? "outlined" : "error"}
                >
                    {user.mirrorStatus == "Sync" ? "Resync" : "Sync"}
                </StateButton>
            </td>
        </tr>
    )
}


export const AdminSync = () => {
    const [collections, setCollections] = useState<string[]>([])
    const {data: syncData, refetch, isLoading} = useUsersSyncStatus()
    const [onlyRecords, setOnlyRecords] = useState(false)

    async function syncAllUsers(collections: string[]) {
        await post("/sync-all-users?" + categoriesSearchParam(collections))
    }
    
    const sortedUsers = syncData 
        ? sortByKey(syncData, u => u.handle, (a: string, b: string) => a < b ? -1 : 1)
        : []
    
    // Count statuses for summary
    const statusCounts = syncData?.reduce((acc, u) => {
        const status = u.mirrorStatus ?? "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {} as Record<string, number>) ?? {}

    return <div className={"flex flex-col items-center mt-8 space-y-8 mb-64 px-4"}>
        <div className={"bg-[var(--background-dark)] p-4 rounded-lg"}>
            <div className="font-medium mb-2">
                Elegir collections
            </div>
            <ListEditor
                newItemText={"collection"}
                items={collections}
                setItems={setCollections}
                options={collectionsList}
            />
        </div>
        <AdminSection title={"Estado de sincronización"}>
            <div className="flex gap-2 mb-4">
                <StateButton
                    size={"small"}
                    handleClick={async () => {
                        await syncAllUsers(collections)
                        return {}
                    }}
                >
                    Sync all
                </StateButton>
                
                <BaseButton size="small" onClick={async () => {
                    await refetch()
                }}>
                    Refetch
                </BaseButton>
            </div>

            {isLoading && <div className="py-4 flex justify-center"><LoadingSpinner/></div>}
            
            {syncData && (
                <>
                    {/* Status summary */}
                    <div className="flex gap-3 mb-4 flex-wrap">
                        <div className="text-sm text-[var(--text-light)]">
                            Total: <span className="font-medium text-[var(--text)]">{syncData.length}</span>
                        </div>
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex items-center gap-1">
                                <SyncStatusBadge status={status}/>
                                <span className="text-sm text-[var(--text-light)]">{count}</span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="max-h-[500px] overflow-y-scroll overscroll-y-contain"
                    >
                        <table className="w-full min-w-[500px]">
                            <thead className="sticky top-0 bg-[var(--background-dark)]">
                                <tr className="border-b border-[var(--background-dark2)]">
                                    <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Usuario</th>
                                    <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Creado</th>
                                    <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Estado</th>
                                    <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map(u => (
                                    <UserSyncRow 
                                        key={u.did} 
                                        user={u} 
                                        collections={collections}
                                        onSync={() => refetch()}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

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
                            const res = await post("/job/reprocess-collection", {
                                jobData: {
                                    collection: collections[0],
                                    onlyRecords
                                }
                            })
                            return {error: res.success === false ? res.error : undefined}
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