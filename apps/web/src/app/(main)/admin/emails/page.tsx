"use client"

import {useState} from "react";
import {useAPI} from "@/components/utils/react/queries";
import {MailSubscriptionsResponse, SentEmailsResponse, SentEmail, EmailTemplatesResponse, EmailTemplate, SendEmailsParams, SendEmailsResponse, SendEmailsTarget, SMTP2GOStatsResponse} from "@cabildo-abierto/api";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {DateSince, localeDate} from "@/components/utils/base/date";
import {AdminSection} from "@/components/admin/admin-section";
import {cn} from "@/lib/utils";
import {fetchBackend, post} from "@/components/utils/react/fetch";
import {useQueryClient} from "@tanstack/react-query";

type Tab = "subscriptions" | "sent" | "templates" | "send" | "stats"

function useMailSubscriptions(enabled: boolean) {
    return useAPI<MailSubscriptionsResponse>("/mail-subscriptions", ["mail-subscriptions"], Infinity, enabled)
}

function useSentEmails(enabled: boolean) {
    return useAPI<SentEmailsResponse>("/sent-emails", ["sent-emails"], Infinity, enabled)
}

function useEmailTemplates(enabled: boolean) {
    return useAPI<EmailTemplatesResponse>("/email-templates", ["email-templates"], Infinity, enabled)
}

function useSMTP2GOStats(enabled: boolean) {
    return useAPI<SMTP2GOStatsResponse>("/smtp2go-stats", ["smtp2go-stats"], 60000, enabled) // Cache for 1 minute
}

function TabButton({active, onClick, children}: {active: boolean, onClick: () => void, children: React.ReactNode}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 text-sm border transition-colors",
                active
                    ? "bg-[var(--background-dark)] border-[var(--text)]"
                    : "border-transparent hover:bg-[var(--background-dark)] opacity-70"
            )}
        >
            {children}
        </button>
    )
}

function CounterBox({value, label, size = "normal"}: {value: number, label: string, size?: "normal" | "large"}) {
    const isLarge = size === "large"
    return (
        <div className={`flex-col ${isLarge ? "text-8xl" : "text-4xl"} bg-[var(--background-dark)] border-4 border-[var(--text)] flex items-center justify-center text-center ${isLarge ? "w-32" : "w-24"} aspect-square`}>
            <div>{value}</div>
            <div className="text-sm text-[var(--text-light)] text-center">{label}</div>
        </div>
    )
}

function StatusBadge({status}: {status: "Subscribed" | "Unsubscribed"}) {
    const isSubscribed = status === "Subscribed"
    return (
        <span className={`px-2 py-0.5 rounded text-xs ${isSubscribed ? "bg-green-800" : "bg-red-800"}`}>
            {isSubscribed ? "Suscripto" : "Desuscripto"}
        </span>
    )
}

function SuccessBadge({success}: {success: boolean}) {
    return (
        <span className={`px-2 py-0.5 rounded text-xs ${success ? "bg-green-800" : "bg-red-800"}`}>
            {success ? "Enviado" : "Fallido"}
        </span>
    )
}

// Preset widths for responsive testing
const PREVIEW_WIDTHS = {
    mobile: 375,
    tablet: 768,
    desktop: null // null means 100%
} as const

function ResizablePreview({html}: {html: string}) {
    const [width, setWidth] = useState<number | null>(null)
    const [iframeHeight, setIframeHeight] = useState(400)

    // Wrap HTML with styles to prevent horizontal scroll and force content reflow
    const wrappedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                html, body {
                    margin: 0;
                    padding: 0;
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                }
                * {
                    max-width: 100% !important;
                    box-sizing: border-box;
                }
                img, table {
                    max-width: 100% !important;
                    height: auto !important;
                }
            </style>
        </head>
        <body>${html}</body>
        </html>
    `
    const iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(wrappedHtml)}`

    return (
        <div className="space-y-2">
            {/* Width controls */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-light)]">Ancho:</span>
                <button
                    onClick={() => setWidth(PREVIEW_WIDTHS.mobile)}
                    className={cn(
                        "px-2 py-1 rounded border",
                        width === PREVIEW_WIDTHS.mobile
                            ? "border-[var(--text)] bg-[var(--background-dark3)]"
                            : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                    )}
                >
                    Mobile (375px)
                </button>
                <button
                    onClick={() => setWidth(PREVIEW_WIDTHS.tablet)}
                    className={cn(
                        "px-2 py-1 rounded border",
                        width === PREVIEW_WIDTHS.tablet
                            ? "border-[var(--text)] bg-[var(--background-dark3)]"
                            : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                    )}
                >
                    Tablet (768px)
                </button>
                <button
                    onClick={() => setWidth(PREVIEW_WIDTHS.desktop)}
                    className={cn(
                        "px-2 py-1 rounded border",
                        width === PREVIEW_WIDTHS.desktop
                            ? "border-[var(--text)] bg-[var(--background-dark3)]"
                            : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                    )}
                >
                    Desktop (100%)
                </button>
                {width && (
                    <span className="text-[var(--text-light)] ml-2">
                        {width}px
                    </span>
                )}
            </div>

            {/* Resizable container - width/height must be inline styles for dynamic values */}
            <div
                className="bg-neutral-500 p-1 rounded overflow-hidden resize-x min-w-80 max-w-full"
                style={{ width: width ? `${width}px` : '100%' }}
                onMouseUp={(e) => {
                    const target = e.currentTarget
                    const newWidth = target.offsetWidth
                    if (newWidth !== width) {
                        setWidth(newWidth)
                    }
                }}
            >
                <iframe
                    src={iframeSrc}
                    className="w-full bg-white rounded border-0"
                    style={{ height: `${iframeHeight}px` }}
                    title="Email preview"
                    sandbox="allow-same-origin"
                />
            </div>

            {/* Height control */}
            <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-light)]">Alto:</span>
                <input
                    type="range"
                    min={200}
                    max={800}
                    value={iframeHeight}
                    onChange={(e) => setIframeHeight(Number(e.target.value))}
                    className="w-32"
                />
                <span className="text-[var(--text-light)]">{iframeHeight}px</span>
            </div>
        </div>
    )
}

function SubscriptionsView() {
    const {data, isLoading} = useMailSubscriptions(true)

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner/>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-4 text-center text-[var(--text-light)]">
                No se pudieron cargar los datos
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Counters Section */}
            <div className="flex flex-wrap items-end gap-4">
                <CounterBox
                    value={data.counts.subscribed}
                    label="Suscriptos"
                    size="large"
                />
                <CounterBox
                    value={data.counts.unsubscribed}
                    label="Desuscriptos"
                />
                <CounterBox
                    value={data.counts.usersWithoutSubscription}
                    label="Sin suscripción"
                />
                <CounterBox
                    value={data.counts.subscriptionsWithoutUserId}
                    label="Suscripciones sin usuario"
                />
            </div>

            {/* Subscriptions List */}
            <AdminSection title="Suscripciones">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--background-dark3)]">
                                <th className="text-left py-2 px-3">Email</th>
                                <th className="text-left py-2 px-3">Handle</th>
                                <th className="text-left py-2 px-3">Estado</th>
                                <th className="text-left py-2 px-3">En CA</th>
                                <th className="text-left py-2 px-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.subscriptions.map((subscription, i) => (
                                <tr
                                    key={subscription.email + i}
                                    className="border-b border-[var(--background-dark)] hover:bg-[var(--background-dark)]"
                                >
                                    <td className="py-2 px-3 font-mono text-xs">
                                        {subscription.email}
                                    </td>
                                    <td className="py-2 px-3">
                                        {subscription.handle ? (
                                            <span className="text-[var(--text-light)]">
                                                @{subscription.handle}
                                            </span>
                                        ) : (
                                            <span className="text-[var(--text-light)] opacity-50">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 px-3">
                                        <StatusBadge status={subscription.status} />
                                    </td>
                                    <td className="py-2 px-3">
                                        {subscription.inCA === true ? (
                                            <span className="text-green-500">Sí</span>
                                        ) : subscription.inCA === false ? (
                                            <span className="text-[var(--text-light)] opacity-50">No</span>
                                        ) : (
                                            <span className="text-[var(--text-light)] opacity-50">—</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-[var(--text-light)]">
                                        {subscription.subscribedAt ? (
                                            <DateSince date={subscription.subscribedAt} />
                                        ) : (
                                            <span className="opacity-50">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
    )
}

function EmailPreview({email}: {email: SentEmail}) {
    const [showPreview, setShowPreview] = useState(false)

    return (
        <div className="border-b border-[var(--background-dark)]">
            <div
                className="py-2 px-3 flex items-center gap-4 hover:bg-[var(--background-dark)] cursor-pointer"
                onClick={() => setShowPreview(!showPreview)}
            >
                <span className="font-mono text-xs flex-1">{email.senderEmail}</span>
                <span className="font-mono text-xs flex-1">{email.recipientEmail}</span>
                <SuccessBadge success={email.success} />
                <span className="text-[var(--text-light)] text-sm">
                    {localeDate(new Date(email.sentAt), false, false, true)}
                </span>
                <span className="text-[var(--text-light)] opacity-50">
                    {showPreview ? "▼" : "▶"}
                </span>
            </div>
            {showPreview && (
                <div className="p-4 bg-[var(--background-dark)] border-t border-[var(--background-dark3)]">
                    <div className="text-sm text-[var(--text-light)] mb-3">
                        <strong>Asunto:</strong> {email.subject}
                    </div>
                    <ResizablePreview html={email.html} />
                </div>
            )}
        </div>
    )
}

function TemplateGroup({templateName, emails}: {templateName: string, emails: SentEmail[]}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="border border-[var(--background-dark3)] rounded mb-4">
            <div
                className="p-3 bg-[var(--background-dark)] flex items-center justify-between cursor-pointer hover:bg-[var(--background-dark3)]"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{templateName}</span>
                    <span className="text-[var(--text-light)] text-sm">
                        ({emails.length} {emails.length === 1 ? "email" : "emails"})
                    </span>
                </div>
                <span className="text-[var(--text-light)]">
                    {expanded ? "▼" : "▶"}
                </span>
            </div>
            {expanded && (
                <div>
                    {emails.map((email) => (
                        <EmailPreview key={email.id} email={email} />
                    ))}
                </div>
            )}
        </div>
    )
}

function SentEmailsView() {
    const {data, isLoading} = useSentEmails(true)

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner/>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-4 text-center text-[var(--text-light)]">
                No se pudieron cargar los datos
            </div>
        )
    }

    const templateNames = Object.keys(data.emailsByTemplate).sort()

    return (
        <div className="space-y-8">
            {/* Counter */}
            <div className="flex flex-wrap items-end gap-4">
                <CounterBox
                    value={data.totalCount}
                    label="Enviados"
                    size="large"
                />
            </div>

            {/* Grouped by template */}
            <AdminSection title="Emails por plantilla">
                {templateNames.length === 0 ? (
                    <div className="text-center text-[var(--text-light)] py-8">
                        No hay emails enviados
                    </div>
                ) : (
                    templateNames.map((templateName) => (
                        <TemplateGroup
                            key={templateName}
                            templateName={templateName}
                            emails={data.emailsByTemplate[templateName]}
                        />
                    ))
                )}
            </AdminSection>
        </div>
    )
}

function TemplateEditor({
    template,
    onSave,
    onCancel,
    isSaving
}: {
    template?: EmailTemplate
    onSave: (data: {name: string, subject: string, html: string, text: string}) => void
    onCancel: () => void
    isSaving: boolean
}) {
    const [name, setName] = useState(template?.name ?? "")
    const [subject, setSubject] = useState(template?.subject ?? "")
    const [html, setHtml] = useState(template?.html ?? "")
    const [text, setText] = useState(template?.text ?? "")
    const [showPreview, setShowPreview] = useState(false)

    const isValid = name.trim() && subject.trim() && html.trim() && text.trim()

    return (
        <div className="border border-[var(--background-dark3)] rounded p-4 space-y-4">
            <div className="text-lg font-medium">
                {template ? "Editar plantilla" : "Nueva plantilla"}
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-sm text-[var(--text-light)] mb-1">
                        Nombre (identificador único)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ej: bienvenida-usuario"
                        className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)]"
                    />
                </div>

                <div>
                    <label className="block text-sm text-[var(--text-light)] mb-1">
                        Asunto
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Asunto del email"
                        className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm focus:outline-none focus:border-[var(--text)]"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm text-[var(--text-light)]">
                            HTML
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-xs text-[var(--text-light)] hover:text-[var(--text)] underline"
                        >
                            {showPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
                        </button>
                    </div>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="<html>...</html>"
                        rows={12}
                        className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                    />
                </div>

                {showPreview && html && (
                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-2">
                            Vista previa HTML
                        </label>
                        <ResizablePreview html={html} />
                    </div>
                )}

                <div>
                    <label className="block text-sm text-[var(--text-light)] mb-1">
                        Texto plano (para clientes sin HTML)
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Versión en texto plano del email..."
                        rows={6}
                        className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                    />
                    <p className="text-xs text-[var(--text-light)] mt-1">
                        Usá {"{{unsubscribe_link}}"} y {"{{invite_link}}"} como variables.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={() => isValid && onSave({name: name.trim(), subject: subject.trim(), html: html.trim(), text: text.trim()})}
                    disabled={!isValid || isSaving}
                    className={cn(
                        "px-4 py-2 text-sm rounded",
                        isValid && !isSaving
                            ? "bg-green-700 hover:bg-green-600 cursor-pointer"
                            : "bg-[var(--background-dark3)] opacity-50 cursor-not-allowed"
                    )}
                >
                    {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
}

function TemplateRow({
    template,
    onEdit,
    onDelete,
    isDeleting
}: {
    template: EmailTemplate
    onEdit: () => void
    onDelete: () => void
    isDeleting: boolean
}) {
    const [showPreview, setShowPreview] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    return (
        <div className="border border-[var(--background-dark3)] rounded mb-3">
            <div className="p-3 flex items-center gap-4">
                <div className="flex-1">
                    <div className="font-mono text-sm">{template.name}</div>
                    <div className="text-[var(--text-light)] text-sm">{template.subject}</div>
                </div>
                <div className="text-[var(--text-light)] text-xs">
                    <DateSince date={template.updatedAt} />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-2 py-1 text-xs rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                    >
                        {showPreview ? "Ocultar" : "Ver"}
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-2 py-1 text-xs rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                    >
                        Editar
                    </button>
                    {confirmDelete ? (
                        <div className="flex gap-1">
                            <button
                                onClick={onDelete}
                                disabled={isDeleting}
                                className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                            >
                                {isDeleting ? "..." : "Confirmar"}
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                disabled={isDeleting}
                                className="px-2 py-1 text-xs rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="px-2 py-1 text-xs rounded border border-red-800 text-red-400 hover:bg-red-900"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            </div>
            {showPreview && (
                <div className="p-4 bg-[var(--background-dark)] border-t border-[var(--background-dark3)]">
                    <ResizablePreview html={template.html} />
                </div>
            )}
        </div>
    )
}

function TemplatesView() {
    const {data, isLoading} = useEmailTemplates(true)
    const queryClient = useQueryClient()
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async (templateData: {name: string, subject: string, html: string, text: string}) => {
        setIsSaving(true)
        setError(null)
        try {
            const res = await fetchBackend({
                route: "/email-template",
                method: "POST",
                body: templateData
            })
            const json = await res.json()
            if (json.error) {
                setError(json.error)
            } else {
                setIsCreating(false)
                queryClient.invalidateQueries({queryKey: ["email-templates"]})
            }
        } catch {
            setError("Error de conexión")
        }
        setIsSaving(false)
    }

    const handleUpdate = async (templateData: {name: string, subject: string, html: string, text: string}) => {
        if (!editingTemplate) return
        setIsSaving(true)
        setError(null)
        try {
            const res = await fetchBackend({
                route: `/email-template/${editingTemplate.id}/update`,
                method: "POST",
                body: templateData
            })
            const json = await res.json()
            if (json.error) {
                setError(json.error)
            } else {
                setEditingTemplate(null)
                queryClient.invalidateQueries({queryKey: ["email-templates"]})
            }
        } catch {
            setError("Error de conexión")
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        setError(null)
        try {
            const res = await fetchBackend({
                route: `/email-template/${id}/delete`,
                method: "POST"
            })
            const json = await res.json()
            if (json.error) {
                setError(json.error)
            } else {
                queryClient.invalidateQueries({queryKey: ["email-templates"]})
            }
        } catch {
            setError("Error de conexión")
        }
        setDeletingId(null)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner/>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-4 text-center text-[var(--text-light)]">
                No se pudieron cargar los datos
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Counter */}
            <div className="flex flex-wrap items-end gap-4">
                <CounterBox
                    value={data.templates.length}
                    label="Plantillas"
                    size="large"
                />
            </div>

            {/* Create/Edit form */}
            {isCreating && (
                <TemplateEditor
                    onSave={handleCreate}
                    onCancel={() => {
                        setIsCreating(false)
                        setError(null)
                    }}
                    isSaving={isSaving}
                />
            )}

            {editingTemplate && (
                <TemplateEditor
                    template={editingTemplate}
                    onSave={handleUpdate}
                    onCancel={() => {
                        setEditingTemplate(null)
                        setError(null)
                    }}
                    isSaving={isSaving}
                />
            )}

            {/* Template list */}
            {!isCreating && !editingTemplate && (
                <AdminSection title="Plantillas">
                    <div className="mb-4">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-4 py-2 text-sm rounded bg-[var(--background-dark)] border border-[var(--text)] hover:bg-[var(--background-dark3)]"
                        >
                            + Nueva plantilla
                        </button>
                    </div>

                    {data.templates.length === 0 ? (
                        <div className="text-center text-[var(--text-light)] py-8">
                            No hay plantillas creadas
                        </div>
                    ) : (
                        data.templates.map((template) => (
                            <TemplateRow
                                key={template.id}
                                template={template}
                                onEdit={() => setEditingTemplate(template)}
                                onDelete={() => handleDelete(template.id)}
                                isDeleting={deletingId === template.id}
                            />
                        ))
                    )}
                </AdminSection>
            )}
        </div>
    )
}

// Send emails view
type SendEmailsState = "idle" | "sending" | "done"

function SendEmailsView() {
    const {data: templatesData, isLoading: templatesLoading} = useEmailTemplates(true)
    const {data: subscriptionsData, isLoading: subscriptionsLoading} = useMailSubscriptions(true)
    const queryClient = useQueryClient()

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [targetType, setTargetType] = useState<SendEmailsTarget>("single")
    const [emailsInput, setEmailsInput] = useState("")
    const [showPreview, setShowPreview] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [sendState, setSendState] = useState<SendEmailsState>("idle")
    const [sendResult, setSendResult] = useState<SendEmailsResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [nameFrom, setNameFrom] = useState("Cabildo Abierto")
    const [emailFrom, setEmailFrom] = useState("")
    const [replyTo, setReplyTo] = useState("Cabildo Abierto <contacto@cabildoabierto.ar>")

    const selectedTemplate = templatesData?.templates.find(t => t.id === selectedTemplateId)

    // Parse emails from input
    const parsedEmails = emailsInput
        .split(/[,\n]/)
        .map(e => e.trim())
        .filter(e => e.length > 0 && e.includes("@"))

    // Get recipient count based on target type
    const getRecipientCount = () => {
        switch (targetType) {
            case "single":
                return parsedEmails.length > 0 ? 1 : 0
            case "list":
                return parsedEmails.length
            case "all_subscribers":
                return subscriptionsData?.counts.subscribed ?? 0
        }
    }

    const recipientCount = getRecipientCount()
    const canSend = selectedTemplate && recipientCount > 0 && sendState === "idle"

    // Check if template uses invite_link
    const templateUsesInviteLink = selectedTemplate && (
        selectedTemplate.html.includes("{{invite_link}}") ||
        selectedTemplate.text.includes("{{invite_link}}")
    )

    const handleSend = async () => {
        if (!canSend) return

        setShowConfirm(false)
        setSendState("sending")
        setError(null)
        setSendResult(null)

        try {
            const body: SendEmailsParams = {
                templateId: selectedTemplateId,
                target: targetType,
                emails: targetType !== "all_subscribers" ? parsedEmails : undefined,
                fromName: nameFrom,
                fromEmail: emailFrom,
                replyTo: replyTo.length > 0 ? replyTo : undefined
            }

            const res = await post<SendEmailsParams, SendEmailsResponse>("/send-emails", body)

            if (res.success === false) {
                setError(res.error)
                setSendState("idle")
            } else {
                setSendResult(res.value)
                setSendState("done")
                // Invalidate sent emails query to refresh
                queryClient.invalidateQueries({queryKey: ["sent-emails"]})
            }
        } catch {
            setError("Error de conexión")
            setSendState("idle")
        }
    }

    const resetForm = () => {
        setSendState("idle")
        setSendResult(null)
        setError(null)
        setShowConfirm(false)
    }

    if (templatesLoading || subscriptionsLoading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner />
            </div>
        )
    }

    if (!templatesData || !subscriptionsData) {
        return (
            <div className="p-4 text-center text-[var(--text-light)]">
                No se pudieron cargar los datos
            </div>
        )
    }

    // Show results after sending
    if (sendState === "done" && sendResult) {
        return (
            <div className="space-y-6">
                <AdminSection title="Resultado del envío">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <CounterBox value={sendResult.totalSent} label="Enviados" size="large" />
                            <CounterBox value={sendResult.totalFailed} label="Fallidos" />
                        </div>

                        {sendResult.results.length > 0 && (
                            <div className="border border-[var(--background-dark3)] rounded">
                                <div className="p-3 bg-[var(--background-dark)] border-b border-[var(--background-dark3)] text-sm font-medium">
                                    Detalle por destinatario
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {sendResult.results.map((result, i) => (
                                        <div
                                            key={i}
                                            className="px-3 py-2 flex items-center gap-3 border-b border-[var(--background-dark)] last:border-b-0 text-sm"
                                        >
                                            <span className="font-mono text-xs flex-1">{result.email}</span>
                                            <SuccessBadge success={result.success} />
                                            {result.error && (
                                                <span className="text-red-400 text-xs">{result.error}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-sm rounded bg-[var(--background-dark)] border border-[var(--text)] hover:bg-[var(--background-dark3)]"
                        >
                            Enviar más emails
                        </button>
                    </div>
                </AdminSection>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-3 bg-red-900 border border-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <AdminSection title="Enviar correos">
                <div className="space-y-4">
                    {/* Template selector */}
                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-1">
                            Plantilla
                        </label>
                        <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm focus:outline-none focus:border-[var(--text)]"
                            disabled={sendState === "sending"}
                        >
                            <option value="">Seleccionar plantilla...</option>
                            {templatesData.templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target type selector */}
                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-2">
                            Destinatarios
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setTargetType("single")}
                                disabled={sendState === "sending"}
                                className={cn(
                                    "px-3 py-2 text-sm rounded border transition-colors",
                                    targetType === "single"
                                        ? "border-[var(--text)] bg-[var(--background-dark3)]"
                                        : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                                )}
                            >
                                Un email
                            </button>
                            <button
                                onClick={() => setTargetType("list")}
                                disabled={sendState === "sending"}
                                className={cn(
                                    "px-3 py-2 text-sm rounded border transition-colors",
                                    targetType === "list"
                                        ? "border-[var(--text)] bg-[var(--background-dark3)]"
                                        : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                                )}
                            >
                                Lista de emails
                            </button>
                            <button
                                onClick={() => setTargetType("all_subscribers")}
                                disabled={sendState === "sending"}
                                className={cn(
                                    "px-3 py-2 text-sm rounded border transition-colors",
                                    targetType === "all_subscribers"
                                        ? "border-[var(--text)] bg-[var(--background-dark3)]"
                                        : "border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                                )}
                            >
                                Todos los suscriptos ({subscriptionsData.counts.subscribed})
                            </button>
                        </div>
                    </div>

                    {/* Email input for single/list */}
                    {(targetType === "single" || targetType === "list") && (
                        <div>
                            <label className="block text-sm text-[var(--text-light)] mb-1">
                                {targetType === "single" ? "Email" : "Emails (separados por coma o salto de línea)"}
                            </label>
                            <textarea
                                value={emailsInput}
                                onChange={(e) => setEmailsInput(e.target.value)}
                                placeholder={targetType === "single" ? "usuario@ejemplo.com" : "email1@ejemplo.com\nemail2@ejemplo.com"}
                                rows={targetType === "single" ? 1 : 4}
                                disabled={sendState === "sending"}
                                className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                            />
                            {parsedEmails.length > 0 && (
                                <p className="text-xs text-[var(--text-light)] mt-1">
                                    {parsedEmails.length} email{parsedEmails.length !== 1 ? "s" : ""} detectado{parsedEmails.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-1">
                            Mail emisor
                        </label>
                        <textarea
                            value={emailFrom}
                            onChange={(e) => setEmailFrom(e.target.value)}
                            placeholder={"novedades@cabildoabierto.ar"}
                            rows={1}
                            disabled={sendState === "sending"}
                            className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-1">
                            Nombre emisor
                        </label>
                        <textarea
                            value={nameFrom}
                            onChange={(e) => setNameFrom(e.target.value)}
                            placeholder={"Cabildo Abierto"}
                            rows={1}
                            disabled={sendState === "sending"}
                            className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-[var(--text-light)] mb-1">
                            Responder a
                        </label>
                        <textarea
                            value={replyTo}
                            onChange={(e) => setReplyTo(e.target.value)}
                            placeholder={"Cabildo Abierto"}
                            rows={1}
                            disabled={sendState === "sending"}
                            className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded text-sm font-mono focus:outline-none focus:border-[var(--text)] resize-y"
                        />
                    </div>

                    {/* Warning for invite_link usage */}
                    {templateUsesInviteLink && (
                        <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded text-sm">
                            <strong>Nota:</strong> Esta plantilla usa {"{{invite_link}}"}. Se generará un código de invitación único para cada destinatario.
                        </div>
                    )}

                    {/* Selected template preview */}
                    {selectedTemplate && (
                        <div className="border border-[var(--background-dark3)] rounded">
                            <div
                                className="p-3 bg-[var(--background-dark)] flex items-center justify-between cursor-pointer hover:bg-[var(--background-dark3)]"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                <div>
                                    <div className="font-mono text-sm">{selectedTemplate.name}</div>
                                    <div className="text-[var(--text-light)] text-sm">Asunto: {selectedTemplate.subject}</div>
                                </div>
                                <span className="text-[var(--text-light)]">
                                    {showPreview ? "▼" : "▶"}
                                </span>
                            </div>
                            {showPreview && (
                                <div className="p-4 border-t border-[var(--background-dark3)]">
                                    <div className="mb-4">
                                        <label className="block text-sm text-[var(--text-light)] mb-2">
                                            Vista previa HTML
                                        </label>
                                        <ResizablePreview html={selectedTemplate.html} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--text-light)] mb-2">
                                            Texto plano
                                        </label>
                                        <pre className="p-3 bg-[var(--background-dark)] rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-40">
                                            {selectedTemplate.text}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary and send button */}
                    <div className="pt-4 border-t border-[var(--background-dark3)]">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 text-sm text-[var(--text-light)]">
                                {recipientCount > 0 ? (
                                    <>Se enviará a <strong className="text-[var(--text)]">{recipientCount}</strong> destinatario{recipientCount !== 1 ? "s" : ""}</>
                                ) : (
                                    "Seleccioná una plantilla y destinatarios"
                                )}
                            </div>

                            {sendState === "sending" ? (
                                <div className="flex items-center gap-2 text-sm text-[var(--text-light)]">
                                    <LoadingSpinner />
                                    Enviando...
                                </div>
                            ) : showConfirm ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--text-light)]">¿Confirmar envío?</span>
                                    <button
                                        onClick={handleSend}
                                        className="px-4 py-2 text-sm rounded bg-green-700 hover:bg-green-600"
                                    >
                                        Sí, enviar
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-4 py-2 text-sm rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)]"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={!canSend}
                                    className={cn(
                                        "px-4 py-2 text-sm rounded",
                                        canSend
                                            ? "bg-green-700 hover:bg-green-600 cursor-pointer"
                                            : "bg-[var(--background-dark3)] opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    Enviar emails
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </AdminSection>
        </div>
    )
}

function PercentageBar({value, label, color = "green"}: {value: number, label: string, color?: "green" | "red" | "yellow"}) {
    const colorClasses = {
        green: "bg-green-600",
        red: "bg-red-600",
        yellow: "bg-yellow-600"
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-24 text-sm text-[var(--text-light)]">{label}</div>
            <div className="flex-1 h-6 bg-[var(--background-dark3)] rounded overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} transition-all duration-500`}
                    style={{width: `${Math.min(100, value)}%`}}
                />
            </div>
            <div className="w-16 text-right text-sm font-mono">{value.toFixed(1)}%</div>
        </div>
    )
}

function StatCard({title, value, subtitle, large = false}: {title: string, value: string | number, subtitle?: string, large?: boolean}) {
    return (
        <div className={`bg-[var(--background-dark)] border border-[var(--background-dark3)] rounded p-4 ${large ? "col-span-2" : ""}`}>
            <div className="text-sm text-[var(--text-light)] mb-1">{title}</div>
            <div className={`font-mono ${large ? "text-4xl" : "text-2xl"}`}>{value}</div>
            {subtitle && <div className="text-xs text-[var(--text-light)] mt-1">{subtitle}</div>}
        </div>
    )
}

function StatsView() {
    const {data, isLoading, refetch, isFetching} = useSMTP2GOStats(true)

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <LoadingSpinner/>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-4 text-center text-[var(--text-light)]">
                <p className="mb-4">No se pudieron cargar las estadísticas de SMTP2GO.</p>
                <p className="text-sm">Asegurate de que la variable <code className="bg-[var(--background-dark)] px-1 rounded">SMTP2GO_API_KEY</code> esté configurada.</p>
            </div>
        )
    }

    const lastUpdated = new Date(data.fetchedAt)

    return (
        <div className="space-y-8">
            {/* Header with refresh */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-[var(--text-light)]">
                    Última actualización: {lastUpdated.toLocaleString("es-AR")}
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="px-3 py-1 text-sm rounded border border-[var(--background-dark3)] hover:bg-[var(--background-dark)] disabled:opacity-50"
                >
                    {isFetching ? "Actualizando..." : "Actualizar"}
                </button>
            </div>

            {/* Summary Stats */}
            <AdminSection title="Resumen de envíos">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Enviados" value={data.summary.sent} large />
                    <StatCard title="Entregados" value={data.summary.delivered} large />
                    <StatCard title="Aperturas" value={data.summary.opens} />
                    <StatCard title="Clicks" value={data.summary.clicks} />
                </div>
            </AdminSection>

            {/* Rates */}
            <AdminSection title="Tasas de rendimiento">
                <div className="space-y-4">
                    <PercentageBar
                        value={data.summary.deliveryRate}
                        label="Entrega"
                        color={data.summary.deliveryRate >= 95 ? "green" : data.summary.deliveryRate >= 90 ? "yellow" : "red"}
                    />
                    <PercentageBar
                        value={data.summary.openRate}
                        label="Apertura"
                        color={data.summary.openRate >= 20 ? "green" : data.summary.openRate >= 10 ? "yellow" : "red"}
                    />
                    <PercentageBar
                        value={data.summary.clickRate}
                        label="Clicks"
                        color={data.summary.clickRate >= 3 ? "green" : data.summary.clickRate >= 1 ? "yellow" : "red"}
                    />
                </div>
            </AdminSection>

            {/* Bounces & Issues */}
            <AdminSection title="Rebotes y problemas">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        title="Total emails (30 días)"
                        value={data.bounces.total.toLocaleString("es-AR")}
                    />
                    <StatCard
                        title="Rechazados"
                        value={data.bounces.rejects.toLocaleString("es-AR")}
                    />
                    <StatCard
                        title="Soft Bounces"
                        value={data.bounces.softBounces.toLocaleString("es-AR")}
                        subtitle="Temporales"
                    />
                    <StatCard
                        title="Hard Bounces"
                        value={data.bounces.hardBounces.toLocaleString("es-AR")}
                        subtitle="Permanentes"
                    />
                </div>
                <div className="space-y-4">
                    <PercentageBar
                        value={data.bounces.bouncePercent}
                        label="Rebotes"
                        color={data.bounces.bouncePercent <= 2 ? "green" : data.bounces.bouncePercent <= 5 ? "yellow" : "red"}
                    />
                    <PercentageBar
                        value={data.spam.spamPercent}
                        label="Spam"
                        color={data.spam.spamPercent <= 0.1 ? "green" : data.spam.spamPercent <= 0.5 ? "yellow" : "red"}
                    />
                </div>
            </AdminSection>

            {/* Health Indicator */}
            <AdminSection title="Estado de reputación">
                {data.bounces.bouncePercent <= 2 && data.spam.spamPercent <= 0.1 && data.summary.deliveryRate >= 95 ? (
                    <div className="p-4 bg-green-900/30 border border-green-700 rounded text-sm">
                        <strong>✓ Buena reputación:</strong> Las métricas están dentro de los rangos saludables. Tasa de rebotes baja y alta entregabilidad.
                    </div>
                ) : data.bounces.bouncePercent <= 5 && data.spam.spamPercent <= 0.5 && data.summary.deliveryRate >= 90 ? (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded text-sm">
                        <strong>⚠ Atención:</strong> Algunas métricas están en zona de precaución. Monitoreá los rebotes y quejas de spam.
                    </div>
                ) : (
                    <div className="p-4 bg-red-900/30 border border-red-700 rounded text-sm">
                        <strong>✗ Problemas detectados:</strong> Las métricas indican posibles problemas de reputación. Revisá la lista de suscriptores y la calidad de los emails.
                    </div>
                )}
            </AdminSection>
        </div>
    )
}

export default function Page() {
    const [activeTab, setActiveTab] = useState<Tab>("subscriptions")

    return (
        <div className="p-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <TabButton
                    active={activeTab === "subscriptions"}
                    onClick={() => setActiveTab("subscriptions")}
                >
                    Suscripciones
                </TabButton>
                <TabButton
                    active={activeTab === "sent"}
                    onClick={() => setActiveTab("sent")}
                >
                    Emails enviados
                </TabButton>
                <TabButton
                    active={activeTab === "templates"}
                    onClick={() => setActiveTab("templates")}
                >
                    Plantillas
                </TabButton>
                <TabButton
                    active={activeTab === "send"}
                    onClick={() => setActiveTab("send")}
                >
                    Enviar correos
                </TabButton>
                <TabButton
                    active={activeTab === "stats"}
                    onClick={() => setActiveTab("stats")}
                >
                    Estadísticas
                </TabButton>
            </div>

            {/* Content */}
            {activeTab === "subscriptions" && <SubscriptionsView />}
            {activeTab === "sent" && <SentEmailsView />}
            {activeTab === "templates" && <TemplatesView />}
            {activeTab === "send" && <SendEmailsView />}
            {activeTab === "stats" && <StatsView />}
        </div>
    )
}
