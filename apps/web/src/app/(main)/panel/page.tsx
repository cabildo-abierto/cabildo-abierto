"use client"
import {rounder, valueToPercentage} from "@cabildo-abierto/utils";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {ReactNode, useEffect, useState} from "react";
import {formatIsoDate} from "@cabildo-abierto/utils";
import Link from "next/link";
import InfoPanel from "@/components/utils/base/info-panel";
import ValidationIcon from "@/components/perfil/validation-icon";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {useSession} from "@/components/auth/use-session";
import {contentUrl, topicUrl} from "@/components/utils/react/url";
import {useAPI} from "@/components/utils/react/queries";


type ArticleStats = {
    uri: string
    created_at: Date
    title: string
    seenBy: number
    seenByVerified: number
    avgReadFraction: number | null
    avgReadFractionVerified: number | null
    income: number
    likes: number
}


type EditedTopicStats = {
    topicId: string
    topicTitle: string
    first_edit: Date
    last_edit: Date
    edits_count: number
    topicSeenBy: number
    topicSeenByVerified: number
    contribution: number | null
    monetizedContribution: number | null
    income: number
}


type AuthorDashboard = {
    articles: ArticleStats[]
    edits: EditedTopicStats[]
    totalReadByArticles: number | null
    totalReadByArticlesVerified: number | null
    avgReadFractionArticles: number | null
    avgReadFractionArticlesVerified: number | null
    totalReadByEdits: number | null
    totalReadByEditsVerified: number | null
    totalIncome: number | null
}

function useAuthorDashboard() {
    return useAPI<AuthorDashboard>("/author-dashboard", ["author"])
}


const StatSquare = ({
                        label,
                        value,
                        info,
                        moreInfoHref,
                        labelVerified,
                        valueVerified
                    }: {
    moreInfoHref?: string
    label: string
    value: string
    info?: ReactNode
    labelVerified?: string
    valueVerified?: string
}) => {
    return <DescriptionOnHover
        description={info}
        moreInfoHref={moreInfoHref}
    >
        <div
            className={"relative border border-[var(--accent-dark)] min-w-32 h-32 flex-col text-[30px] space-y-2 text-center flex items-center justify-center"}
        >
            <div>
                <div className={"px-2 font-bold"}>
                    {value}
                </div>
                <div className={"font-light text-center text-sm text-[var(--text-light)] px-2"}>
                    {label}
                </div>
            </div>

            {valueVerified != null && <div className={"absolute bottom-1 left-2 text-[var(--text-light)]"}>
                <div className={"text-xs flex space-x-1 items-center"}>
                    <div>
                        {valueVerified}
                    </div>
                    <div className={"pb-[2px]"}>
                        <ValidationIcon
                            handle={undefined}
                            verification={"persona"}
                            fontSize={12}
                        />
                    </div>
                </div>
            </div>}
        </div>
    </DescriptionOnHover>
}


const CardStat = ({label, value, info, moreInfoHref}: {
    label: string,
    value: string,
    info?: ReactNode,
    moreInfoHref?: string
}) => {
    return <div className={"flex space-x-1 items-center text-sm font-light"}>
        <div>
        <span className={""}>
            {label}.
        </span> <span className={"text-[var(--text)] text-sm"}>
            {value}
        </span>
        </div>
        {info && <InfoPanel
            iconFontSize={16}
            text={info}
            moreInfoHref={moreInfoHref}
        />}
    </div>
}


const ArticleStatsCard = ({article}: { article: ArticleStats }) => {
    const {user} = useSession()
    return <Link
        href={contentUrl(article.uri, user?.handle)}
        className={"hover:bg-[var(--background-dark)] border border-[var(--accent-dark)] p-4 mx-2 flex flex-col sm:flex-row sm:justify-between"}
    >
        <div className={"sm:w-[50%]"}>
            <h2>
                {article.title}
            </h2>
            <div className={"text-[var(--text-light)] font-light text-sm"}>
                {formatIsoDate(article.created_at)}
            </div>
        </div>
        <div className={"sm:w-[40%] sm:text-base text-sm text-[var(--text-light)]"}>
            <CardStat
                label={"Lectores"}
                value={rounder(article.seenBy)}
            />
            <CardStat
                label={"Lectura promedio"}
                value={(article.avgReadFraction * 100).toFixed(2) + "%"}
            />
            <CardStat
                label={"Ingresos"}
                value={"$" + article.income.toFixed(2)}
            />
        </div>
    </Link>
}


const EditStatsCard = ({topicVersion}: { topicVersion: EditedTopicStats }) => {
    return <Link
        href={topicUrl(topicVersion.topicId)}
        className="hover:bg-[var(--background-dark)] p-4 border border-[var(--accent-dark)] mx-2 flex flex-col sm:flex-row sm:justify-between"
    >
        <div className={"sm:w-[50%]"}>
            <h2>
                {topicVersion.topicTitle}
            </h2>
            <div className={"text-[var(--text-light)] text-sm"}>
                {formatIsoDate(topicVersion.first_edit)}
            </div>
        </div>
        <div className={"sm:w-[40%] text-[var(--text-light)]"}>
            <CardStat
                label={"Contribución"}
                value={`${(topicVersion.contribution * 100).toFixed(2)}% (${(topicVersion.monetizedContribution * 100).toFixed(2)}%)`}
                info={"El porcentaje de los caracteres en la historia del artículo que agregaste vos. Entre paréntesis se muestra el porcentaje de las remuneraciones del tema que te corresponden, que puede no ser igual."}
                moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones")}
            />
            <CardStat label={"Lectores"} value={rounder(topicVersion.topicSeenBy)}/>
            <CardStat label={"Ingresos"} value={"$" + topicVersion.income.toFixed(2)}/>
        </div>
    </Link>
}


const Page = () => {
    let {data, isLoading} = useAuthorDashboard()

    const [selected, setSelected] = useState<string>("")
    const enabledOptions: string[] = []
    if (data && data.articles.length > 0) enabledOptions.push("Artículos")
    if (data && data.edits.length > 0) enabledOptions.push("Ediciones")

    useEffect(() => {
        if (selected.length == 0 && enabledOptions.length > 0) {
            setSelected(enabledOptions[0])
        }
    }, [enabledOptions]);

    const isAuthor = enabledOptions.length > 0

    return <div className={"flex flex-col"}>
        {isLoading && <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>}
        {!data && !isLoading && <div className={"py-16 text-center text-[var(--text-light)]"}>
            Ocurrió un error al cargar los datos.
        </div>}
        {data && !isAuthor && <div className={"text-[var(--text-light)] text-center py-16 px-4"}>
            Escribí tu primer artículo o editá un tema para convertirte en autor.
        </div>}
        {data && isAuthor && <div className={"pt-4 px-2 space-y-4 pb-32"}>
            <div className={"flex flex-wrap gap-2"}>
                <StatSquare
                    label={"Artículos"}
                    value={rounder(data.articles.length)}
                />
                <StatSquare
                    label={"Temas editados"}
                    value={rounder(data.edits.length)}
                />
                <StatSquare
                    label={"Ingresos totales"}
                    value={"$" + data.totalIncome.toFixed(2)}
                    info={"Tus ingresos sumados de artículos y temas. Los ingresos de cada lectura pueden tardar hasta 30 días en asignarse. Se asigna considerando solo los lectores verificadas como personas."}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones")}
                />
                {data.totalReadByArticles != null && <StatSquare
                    label={"Lecturas en artículos"}
                    value={rounder(data.totalReadByArticles)}
                    info={<span>
                        El total de <b>lecturas únicas</b> de tus artículos. Abajo a la izquierda se muestra la cantidad de lecturas únicas de usuarios verificados.
                    </span>}
                    valueVerified={rounder(data.totalReadByArticlesVerified)}
                />}
                {data.avgReadFractionArticles != null && <StatSquare
                    label={"Lectura promedio en artículos"}
                    value={valueToPercentage(data.avgReadFractionArticles)}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones")}
                    info={"Estimación de cuánto leyó en promedio cada lector de tus artículos. Abajo a la izquierda se muestra el promedio de los lectores verificados."}
                    valueVerified={valueToPercentage(data.avgReadFractionArticlesVerified)}
                />}
                {data.totalReadByEdits != null && <StatSquare
                    label={"Lecturas en temas"}
                    value={rounder(data.totalReadByEdits)}
                    info={<span>
                        El total de <b>lecturas únicas</b> en temas que editaste. En cada tema se cuentan las lecturas desde tu primera edición del tema. Abajo a la izquierda se muestra el total de lecturas únicas de usuarios verificados.
                    </span>}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones")}
                    valueVerified={data.totalReadByEditsVerified.toString()}
                />}
            </div>
            <div className={""}>
                <SelectionComponent
                    onSelection={(v: string) => setSelected(v)}
                    options={["Artículos", "Ediciones"]}
                    optionsNodes={feedOptionNodes(40)}
                    selected={selected}
                    className={"flex border-b"}
                    optionContainerClassName={"flex"}
                />
                {selected != null && (selected == "Artículos" ? <div className={"space-y-4 py-2"}>
                        {data.articles.map((a, idx) => {
                            return <div key={idx}>
                                <ArticleStatsCard article={a}/>
                            </div>
                        })}
                        {data.articles.length == 0 && <div className={"text-center text-[var(--text-light)] py-16"}>
                            Todavía no escribiste ningún artículo.
                        </div>}
                    </div> :
                    <div className={"space-y-4 py-2"}>
                        {data.edits.map((a, idx) => {
                            return <div key={idx}>
                                <EditStatsCard topicVersion={a}/>
                            </div>
                        })}
                        {data.edits.length == 0 && <div className={"text-center text-[var(--text-light)] py-16"}>
                            Todavía no editaste ningún tema.
                        </div>}
                    </div>)}
            </div>
        </div>}
    </div>
}


export default Page