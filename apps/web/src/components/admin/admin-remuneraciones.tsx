import {useAPI} from "@/components/utils/react/queries";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {cn} from "@/lib/utils";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {formatIsoDate} from "@cabildo-abierto/utils";
import {useState} from "react";
import {BackButton} from "@/components/utils/base/back-button";
import {getCollectionFromUri, isArticle} from "@cabildo-abierto/utils";
import {sum} from "@cabildo-abierto/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import dynamic from "next/dynamic";


const WAUPlot = dynamic(() => import("./wau-plot").then(mod => mod.WAUPlot), {ssr: false});

type UserMonths = {
    did: string
    handle: string
    months: {
        id: string
        start: Date
        end: Date
        active: boolean
        fullyConfirmed: boolean
    }[]
}[]

export function useUserMonthStats() {
    return useAPI<UserMonths>("/user-months", ["user-months"])
}


type UserMonthView = {
    id: string
    userId: string
    value: number
    fullyConfirmed: boolean
    payments: UserMonthPaymentView[]
}


type UserMonthPaymentView = {
    amount: number
    status: "Pending" | "Payed" | "Confirmed"
    uri: string
    title: string | null
    topicId: string | null
    handle: string | null
}


function useUserMonthPayments(id: string) {
    return useAPI<UserMonthView>(`/user-month-payments/${id}`, ["user-month-payments", id])
}


const UserMonthPayments = ({monthId, onBack}: {
    monthId: string
    onBack: () => void
}) => {
    const {data, isLoading} = useUserMonthPayments(monthId)
    if (isLoading) return <LoadingSpinner/>

    const total = sum(data.payments, d => d.amount)

    return <div className={"space-y-1"}>
        <BackButton onClick={onBack}/>
        <div>
            <div>
                Valor mes: ${data.value}
            </div>
            <div>
                A asignar: ${data.value * 0.7}
            </div>
            <div>
                Total: ${total.toFixed(2)}
            </div>
        </div>
        {data.payments.map((d, i) => {
            const collection = getCollectionFromUri(d.uri)
            return <div key={i}
                        className={cn("p-2 w-full border break-all", d.status == "Confirmed" ? "bg-blue-500" : "")}>
                <DescriptionOnHover description={d.uri}>
                    <div className={"w-full grid grid-cols-[1fr_3fr_2fr_1fr] "}>
                        <div className={"text-sm text-[var(--text-light)]"}>
                            {isArticle(collection) ? "Artículo" : "Tema"}
                        </div>
                        <div className={"text-sm"}>
                            {d.title ?? d.topicId}
                        </div>
                        <div className={"text-sm"}>
                            @{d.handle}
                        </div>
                        <div className={"flex justify-end"}>
                            ${d.amount?.toFixed(2)}
                        </div>
                    </div>
                </DescriptionOnHover>
            </div>
        })}
    </div>
}


const AdminUserMonths = () => {
    const {data, isLoading} = useUserMonthStats()
    const [selected, setSelected] = useState<string | null>(null)

    if (isLoading) return <LoadingSpinner/>

    if (selected != null) {
        return <UserMonthPayments monthId={selected} onBack={() => {
            setSelected(null)
        }}/>
    }

    return <div>
        {data.map((d, i) => {
            return <div key={i}>
                <div>
                    @{d.handle}
                </div>
                <div className={"flex space-x-1 flex-wrap"}>
                    {d.months.map((m, j) => {
                        return <div key={j}>
                            <DescriptionOnHover
                                description={`${formatIsoDate(m.start)} - ${formatIsoDate(m.end)} (${m.id})`}
                            >
                                <div
                                    onClick={() => {
                                        setSelected(m.id)
                                    }}
                                    className={cn("cursor-pointer h-4 w-4", m.fullyConfirmed ? "bg-blue-500" : (m.active ? "bg-[var(--green)]" : "bg-[var(--red)]"))}
                                />
                            </DescriptionOnHover>
                        </div>
                    })}
                </div>
            </div>
        })}
    </div>
}


type AuthorStats = {
    did: string
    handle: string
    accIncome: number
}


function useTopAuthors() {
    return useAPI<AuthorStats[]>("/top-authors", ["top-authors"])
}


export const AdminTopAuthors = () => {
    const {data, isLoading} = useTopAuthors()

    if (isLoading) return <LoadingSpinner/>

    const total = data ? sum(data, d => d.accIncome) : undefined
    const count = data ? sum(data, d => d.accIncome != null ? 1 : 0) : undefined

    return <div>
        <div>
            Total: {total}
        </div>
        <div>
            Autores: {count}
        </div>
        {data && data.map((a, i) => {
            return <div key={i} className={"grid grid-cols-2"}>
                <div>
                    {a.handle ? `@${a.handle}` : a.did}
                </div>
                <div>
                    {a.accIncome}
                </div>
            </div>
        })}
    </div>
}


export function useReadSessionsPlot() {
    return useAPI<{ date: Date, count: number }[]>("/read-sessions-plot", ["read-sessions-plot"])
}


const AdminReadSessions = () => {
    const {data, isLoading} = useReadSessionsPlot()

    if (isLoading) return <LoadingSpinner/>
    if (data) {
        return <WAUPlot
            data={data}
            title={"Lecturas"}
        />
    }
}

export const AdminRemuneraciones = () => {
    const [viewingReadSessions, setViewingReadSessions] = useState(false)

    return <div className={"pb-32 space-y-16 flex flex-col items-center"}>
        {viewingReadSessions ?
        <AdminReadSessions/> :
        <BaseButton
            onClick={() => {setViewingReadSessions(true)}}
        >
            Ver lecturas
        </BaseButton>}
        <AdminUserMonths/>
        <AdminTopAuthors/>
    </div>
}