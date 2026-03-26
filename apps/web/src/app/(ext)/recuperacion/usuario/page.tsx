"use client"
import {PageFrame} from "@/components/utils/page-frame";
import {useDebounce} from "@/components/utils/react/debounce";
import {useEffect, useState} from "react";
import {get, post} from "@/components/utils/react/fetch";
import {ArCabildoabiertoActorDefs, type SendAccountRecoveryEmailBody} from "@cabildo-abierto/api";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import {StateButton} from "@/components/utils/base/state-button";
import {isValidEmail} from "@/components/feed/config/account-settings";
import {Note} from "@/components/utils/base/note";
import {useQuery} from "@tanstack/react-query";
import {Paragraph} from "@/components/utils/base/paragraph";


export default function Page() {
    return <PageFrame>
        <RecoverAccountSection/>
    </PageFrame>
}


type RecoverAccountTab = "search" | "email"

function RecoverAccountSection() {
    const [tab, setTab] = useState<RecoverAccountTab>("search")
    const [searchQuery, setSearchQuery] = useState("")
    const [email, setEmail] = useState("")
    const [emailSuccess, setEmailSuccess] = useState(false)
    const [emailResendCooldownSec, setEmailResendCooldownSec] = useState(0)

    useEffect(() => {
        if (emailResendCooldownSec <= 0) return
        const t = setTimeout(() => setEmailResendCooldownSec((s) => s - 1), 1000)
        return () => clearTimeout(t)
    }, [emailResendCooldownSec])

    const debouncedSearch = useDebounce(searchQuery, 300)

    const {data: searchResult, isLoading} = useQuery({
        queryKey: ["recovery-search", debouncedSearch],
        queryFn: () => get<ArCabildoabiertoActorDefs.ProfileViewBasic[]>(
            "/search-users/" + encodeURIComponent(debouncedSearch) + "?limit=10"
        ),
        enabled: tab === "search" && debouncedSearch.length > 0
    })

    const users = searchResult?.success === true ? searchResult.value : []

    async function onSendEmail() {
        const res = await post<SendAccountRecoveryEmailBody>("/send-account-recovery-email", {email: email.trim()})
        if (res.success === true) {
            setEmailSuccess(true)
            setEmailResendCooldownSec(30)
            return {}
        }
        return {error: res.error ?? "Ocurrió un error."}
    }

    return (
        <div className="flex justify-center pb-12">
            <div className="space-y-4 max-w-80">
                <h2 className="text-base font-medium normal-case text-center">Recuperar cuenta</h2>
                <Paragraph className={"text-sm text-[var(--text-light)]"}>
                    Podés buscar tu cuenta abajo o, si asociaste una dirección de correo, podemos enviarte tu usuario.
                </Paragraph>
                <div className="flex gap-4 border-b border-[var(--accent-dark)] pb-2">
                    <button
                        type="button"
                        onClick={() => setTab("search")}
                        className={`text-sm hover:text-[var(--text)] ${tab === "search" ? "font-medium" : "text-[var(--text-light)]"}`}
                    >
                        Buscar cuenta
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("email")}
                        className={`text-sm hover:text-[var(--text)] ${tab === "email" ? "font-medium" : "text-[var(--text-light)]"}`}
                    >
                        Enviar por correo
                    </button>
                </div>

                {tab === "search" && (
                    <div className="space-y-3">
                        <BaseTextField
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre o usuario..."
                            label=""
                        />
                        {debouncedSearch.length > 0 && (
                            <>
                                {isLoading ? (
                                    <div className="py-8">
                                        <LoadingSpinner/>
                                    </div>
                                ) : (
                                    <div
                                        className="max-h-[400px] overflow-y-auto custom-scrollbar border border-[var(--accent-dark)] rounded overflow-hidden divide-y divide-[var(--accent-dark)]">
                                        {users.length === 0 ? (
                                            <p className="p-4 text-sm text-[var(--text-light)]">
                                                No se encontraron resultados.
                                            </p>
                                        ) : (
                                            users.map((u) => (
                                                <SmallUserSearchResult key={u.did} user={u}/>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {tab === "email" && (
                    <div className="space-y-3">
                        <BaseTextField
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            label=""
                        />
                        <StateButton
                            size="small"
                            variant="outlined"
                            handleClick={onSendEmail}
                            disabled={!isValidEmail(email.trim()) || emailResendCooldownSec > 0}
                        >
                            {emailResendCooldownSec > 0 ? `Esperá ${emailResendCooldownSec}s` : "Enviar"}
                        </StateButton>
                        {emailSuccess && (
                            <Note className="text-left text-[var(--text-light)]">
                                Si el correo está registrado, ya te enviamos tu nombre de usuario.
                            </Note>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
