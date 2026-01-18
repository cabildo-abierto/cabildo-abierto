"use client"
import React from "react";
import {AdminSection} from "./admin-section";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {BaseButton} from "@/components/utils/base/base-button";
import {useWorkerState, WorkerState} from "@/queries/getters/admin";


function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
    return `${(ms / 3600000).toFixed(1)}h`
}


function formatTimestamp(ts: number | undefined): string {
    if (!ts) return "-"
    return new Date(ts).toLocaleString()
}


function CountCard({label, count, variant}: {label: string, count: number, variant?: "success" | "warning" | "error" | "info"}) {
    const bgColors = {
        success: "bg-green-800",
        warning: "bg-yellow-600",
        error: "bg-red-700",
        info: "bg-blue-700"
    }
    
    const bg = variant ? bgColors[variant] : "bg-[var(--background-dark2)]"
    
    return (
        <div className={`${bg} rounded-lg p-3 flex flex-col items-center min-w-[100px]`}>
            <span className="text-2xl font-bold">{count}</span>
            <span className="text-xs text-[var(--text-light)] capitalize">{label}</span>
        </div>
    )
}


function JobStatusBadge({status}: {status: "active" | "failed" | "waiting" | "delayed" | "completed"}) {
    const config = {
        active: {bg: "bg-blue-600", label: "Activo"},
        failed: {bg: "bg-red-700", label: "Fallido"},
        waiting: {bg: "bg-yellow-600", label: "En espera"},
        delayed: {bg: "bg-orange-600", label: "Demorado"},
        completed: {bg: "bg-green-700", label: "Completado"}
    }
    const c = config[status]
    return <span className={`${c.bg} px-2 py-0.5 rounded text-xs`}>{c.label}</span>
}


function ActiveJobsTable({jobs}: {jobs: WorkerState["activeJobs"]}) {
    if (jobs.length === 0) {
        return <div className="text-[var(--text-light)] text-sm py-4 text-center">No hay trabajos activos</div>
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
                <thead>
                    <tr className="border-b border-[var(--background-dark2)]">
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">ID</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Nombre</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Estado</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Iniciado</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Duración</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, i) => (
                        <tr key={job.id ?? i} className="border-b border-[var(--background-dark2)] hover:bg-[var(--background-dark2)]">
                            <td className="py-2 px-3 text-sm font-mono">{job.id?.slice(0, 8) ?? "-"}</td>
                            <td className="py-2 px-3 text-sm">{job.name}</td>
                            <td className="py-2 px-3"><JobStatusBadge status="active"/></td>
                            <td className="py-2 px-3 text-sm text-[var(--text-light)]">
                                {formatTimestamp(job.processedOn)}
                            </td>
                            <td className="py-2 px-3 text-sm">
                                {job.processedOn ? formatDuration(Date.now() - job.processedOn) : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


function FailedJobsTable({jobs}: {jobs: WorkerState["failedJobs"]}) {
    if (jobs.length === 0) {
        return <div className="text-[var(--text-light)] text-sm py-4 text-center">No hay trabajos fallidos</div>
    }
    
    return (
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full min-w-[500px]">
                <thead className="sticky top-0 bg-[var(--background-dark)]">
                    <tr className="border-b border-[var(--background-dark2)]">
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">ID</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Nombre</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Estado</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Error</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Finalizado</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, i) => (
                        <tr key={job.id ?? i} className="border-b border-[var(--background-dark2)] hover:bg-[var(--background-dark2)]">
                            <td className="py-2 px-3 text-sm font-mono">{job.id?.slice(0, 8) ?? "-"}</td>
                            <td className="py-2 px-3 text-sm">{job.name}</td>
                            <td className="py-2 px-3"><JobStatusBadge status="failed"/></td>
                            <td className="py-2 px-3 text-sm text-red-400 max-w-[200px] truncate" title={job.failedReason}>
                                {job.failedReason ?? "-"}
                            </td>
                            <td className="py-2 px-3 text-sm text-[var(--text-light)]">
                                {formatTimestamp(job.finishedOn)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


function ScheduledJobsTable({jobs}: {jobs: WorkerState["scheduledJobs"]}) {
    if (jobs.length === 0) {
        return <div className="text-[var(--text-light)] text-sm py-4 text-center">No hay trabajos programados</div>
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
                <thead>
                    <tr className="border-b border-[var(--background-dark2)]">
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Nombre</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Intervalo</th>
                        <th className="py-2 px-3 text-left text-sm font-medium text-[var(--text-light)]">Próxima ejecución</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, i) => (
                        <tr key={job.name ?? i} className="border-b border-[var(--background-dark2)] hover:bg-[var(--background-dark2)]">
                            <td className="py-2 px-3 text-sm">{job.name ?? "-"}</td>
                            <td className="py-2 px-3 text-sm text-[var(--text-light)]">
                                {job.every ? formatDuration(job.every) : "-"}
                            </td>
                            <td className="py-2 px-3 text-sm text-[var(--text-light)]">
                                {formatTimestamp(job.next)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


function RegisteredJobsList({jobs}: {jobs: string[]}) {
    return (
        <div className="flex flex-wrap gap-2">
            {jobs.map(job => (
                <span key={job} className="bg-[var(--background-dark2)] px-2 py-1 rounded text-xs">
                    {job}
                </span>
            ))}
        </div>
    )
}


export const AdminWorker = () => {
    const {data: workerState, refetch, isLoading} = useWorkerState()

    return (
        <div className="flex flex-col items-center mt-8 space-y-8 mb-64 px-4">
            <AdminSection title="Estado del Worker">
                <div className="flex gap-2 mb-4">
                    <BaseButton size="small" onClick={() => refetch()}>
                        Actualizar
                    </BaseButton>
                </div>

                {isLoading && (
                    <div className="py-4 flex justify-center">
                        <LoadingSpinner/>
                    </div>
                )}

                {workerState && (
                    <div className="space-y-6">
                        {/* Counts summary */}
                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-light)] mb-3">Conteo de trabajos</h3>
                            <div className="flex flex-wrap gap-3">
                                <CountCard label="Activos" count={workerState.counts.active} variant="info"/>
                                <CountCard label="En espera" count={workerState.counts.waiting} variant="warning"/>
                                <CountCard label="Demorados" count={workerState.counts.delayed}/>
                                <CountCard label="Priorizados" count={workerState.counts.prioritized}/>
                                <CountCard label="Completados" count={workerState.counts.completed} variant="success"/>
                                <CountCard label="Fallidos" count={workerState.counts.failed} variant={workerState.counts.failed > 0 ? "error" : undefined}/>
                            </div>
                        </div>
                    </div>
                )}
            </AdminSection>

            {workerState && (
                <>
                    <AdminSection title="Trabajos activos">
                        <ActiveJobsTable jobs={workerState.activeJobs}/>
                    </AdminSection>

                    <AdminSection title="Trabajos fallidos">
                        <FailedJobsTable jobs={workerState.failedJobs}/>
                    </AdminSection>

                    <AdminSection title="Trabajos programados (Crons)">
                        <ScheduledJobsTable jobs={workerState.scheduledJobs}/>
                    </AdminSection>

                    <AdminSection title="Trabajos registrados">
                        <RegisteredJobsList jobs={workerState.registeredJobs}/>
                    </AdminSection>
                </>
            )}
        </div>
    )
}
