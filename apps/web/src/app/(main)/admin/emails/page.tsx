"use client"

import {useState} from "react";
import {useAPI} from "@/components/utils/react/queries";
import {MailSubscriptionsResponse, SentEmailsResponse, SentEmail} from "@cabildo-abierto/api";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {DateSince, localeDate} from "@/components/utils/base/date";
import {AdminSection} from "@/components/admin/admin-section";
import {cn} from "@/lib/utils";

type Tab = "subscriptions" | "sent"

function useMailSubscriptions(enabled: boolean) {
    return useAPI<MailSubscriptionsResponse>("/mail-subscriptions", ["mail-subscriptions"], Infinity, enabled)
}

function useSentEmails(enabled: boolean) {
    return useAPI<SentEmailsResponse>("/sent-emails", ["sent-emails"], Infinity, enabled)
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
                    <div className="text-sm text-[var(--text-light)] mb-2">
                        <strong>Asunto:</strong> {email.subject}
                    </div>
                    <div 
                        className="bg-white text-black p-4 rounded max-h-96 overflow-auto"
                        dangerouslySetInnerHTML={{__html: email.html}}
                    />
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
            </div>

            {/* Content */}
            {activeTab === "subscriptions" && <SubscriptionsView />}
            {activeTab === "sent" && <SentEmailsView />}
        </div>
    )
}
