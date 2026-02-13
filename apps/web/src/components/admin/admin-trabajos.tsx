"use client"
import {StateButton} from "@/components/utils/base/state-button"
import {AdminSection} from "./admin-section";
import {formatIsoDate} from "@cabildo-abierto/utils";
import {DateSince} from "@/components/utils/base/date";
import {listOrder, sortByKey} from "@cabildo-abierto/utils";
import {useJobApplications} from "@/queries/getters/admin";
import {post} from "@/components/utils/react/fetch";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {BaseButton} from "@/components/utils/base/base-button";
import {DownloadIcon, TrashIcon} from "@phosphor-icons/react";


function DownloadCVButton({id, fileName}: { id: string, fileName: string }) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ""

    const handleDownload = async () => {
        try {
            const response = await fetch(`${backendUrl}/job-application-cv/${id}`, {
                credentials: "include"
            })
            
            if (!response.ok) {
                console.error("Error downloading CV:", response.statusText)
                return
            }

            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Error downloading CV:", error)
        }
    }

    return (
        <BaseButton
            size={"small"}
            onClick={handleDownload}
            endIcon={<DownloadIcon/>}
        >
            {fileName}
        </BaseButton>
    );
}


export const AdminTrabajos = () => {
    const {data: jobApplications, isLoading, refetch} = useJobApplications()

    if (isLoading) return <div className={"py-8 flex justify-center"}>
        <LoadingSpinner/>
    </div>

    if (!jobApplications) return <div className={"py-8 text-center"}>Error al cargar las postulaciones</div>

    const sortedApplications = sortByKey(jobApplications, c => {
        return c.createdAt ? [new Date(c.createdAt).getTime()] : [0]
    }, listOrder)

    return <div className={"mt-12 flex flex-col items-center w-screen space-y-4 mb-64 px-4"}>
        <AdminSection title={"Postulaciones de trabajo"}>
            <div className="space-y-4">
                {sortedApplications.length === 0 && (
                    <div className="text-center text-[var(--text-light)]">
                        No hay postulaciones
                    </div>
                )}
                {sortedApplications.map((a) => {
                    return <div
                        key={a.id}
                        className={"space-y-2 bg-[var(--background-dark)] rounded-lg p-4 flex flex-col items-start w-[400px]"}
                    >
                        <div className="flex justify-between w-full items-start">
                            <div className={"font-bold text-lg"}>
                                {a.name}
                            </div>
                            <div>
                                {a.seen ? (
                                    <div className={"bg-green-800 rounded text-sm px-2 py-0.5"}>
                                        Vista
                                    </div>
                                ) : (
                                    <div className={"bg-yellow-600 rounded text-sm px-2 py-0.5"}>
                                        Nueva
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-[var(--text-light)] text-sm">
                            {a.email}
                        </div>
                        
                        <div className={"bg-[var(--background-dark2)] rounded px-2 py-1 text-sm"}>
                            Puesto: <span className="font-medium">{a.job}</span>
                        </div>
                        
                        {a.comment && (
                            <div className={"bg-[var(--background-dark3)] rounded p-2 text-sm w-full"}>
                                {a.comment}
                            </div>
                        )}
                        
                        {a.cvFileName && (
                            <div className="py-1">
                                <DownloadCVButton id={a.id} fileName={a.cvFileName} />
                            </div>
                        )}
                        
                        <div className={"text-sm text-[var(--text-light)]"}>
                            Hace <DateSince date={a.createdAt}/>
                            {a.createdAt && (
                                <span className="ml-2">({formatIsoDate(a.createdAt)})</span>
                            )}
                        </div>
                        
                        <div className={"w-full flex justify-end pt-2 gap-2"}>
                            {!a.seen && (
                                <StateButton
                                    size={"small"}
                                    handleClick={async () => {
                                        const res = await post<{}, {}>(`/job-application-seen/${a.id}`)
                                        refetch()
                                        return {error: res.success === false ? res.error : undefined}
                                    }}
                                >
                                    Marcar como vista
                                </StateButton>
                            )}
                            <StateButton
                                size={"small"}
                                handleClick={async () => {
                                    const res = await post<{}, {}>(`/job-application-delete/${a.id}`)
                                    refetch()
                                    return {error: res.success === false ? res.error : undefined}
                                }}
                                endIcon={<TrashIcon />}
                            >
                                Eliminar
                            </StateButton>
                        </div>
                    </div>
                })}
            </div>
        </AdminSection>
    </div>
}
