"use client"
import {rounder} from "@/utils/strings";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import PageHeader from "../../../../modules/ui-utils/src/page-header";
import {useAPI} from "@/queries/utils";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {ReactNode, useEffect, useState} from "react";
import {Button} from "../../../../modules/ui-utils/src/button";
import {formatIsoDate} from "@/utils/dates";
import {contentUrl, topicUrl} from "@/utils/uri";
import Link from "next/link";
import InfoPanel from "../../../../modules/ui-utils/src/info-panel";


type ArticleStats = {
    uri: string
    created_at: Date
    title: string
    seenBy: number
    avgReadFraction: number
    income: number
}


type EditedTopicStats = {
    topicId: string
    topicTitle: string
    first_edit: Date
    last_edit: Date
    edits_count: number
    topicSeenBy: number
    topicAvgReadFraction: number
    contribution: number | null
    monetizedContribution: number | null
    income: number
}


type AuthorDashboard = {
    articles: ArticleStats[]
    edits: EditedTopicStats[]
    totalReadByArticles: number | null
    avgReadFractionArticles: number | null
    totalReadByEdits: number | null
    avgReadFractionEdits: number | null
    totalIncome: number
}

function useAuthorDashboard() {
    return useAPI<AuthorDashboard>("/author-dashboard", ["author"])
}


const StatSquare = ({label, value, info, moreInfoHref}: { moreInfoHref?: string, label: string, value: string, info?: string }) => {
    return <div
        className={"relative rounded-lg min-w-32 h-32 bg-[var(--background-dark)] flex-col text-[30px] text-center flex items-center justify-center"}
    >
        <div className={"px-2 font-bold"}>
            {value}
        </div>
        <div className={"font-light text-center text-sm text-[var(--text-light)] px-2"}>
            {label}
        </div>
        {info && <div className={"absolute bottom-[-6px] right-1"}>
            <InfoPanel text={info} moreInfoHref={moreInfoHref} />
        </div>}
    </div>
}


const CardStat = ({label, value, info, moreInfoHref}: { label: string, value: string, info?: ReactNode, moreInfoHref?: string }) => {
    return <div className={"flex space-x-1 items-center text-sm"}>
        <div>
        <span className={" font-semibold"}>
            {label}.
        </span> <span className={"text-[var(--text)] text-extralight text-sm"}>
            {value}
        </span>
        </div>
        {info && <InfoPanel text={info} moreInfoHref={moreInfoHref}/>}
    </div>
}


const ArticleStatsCard = ({article}: { article: ArticleStats }) => {
    return <Link
        href={contentUrl(article.uri)}
        className={"hover:bg-[var(--background-dark3)] p-4 rounded-lg bg-[var(--background-dark2)] mx-2 flex flex-col sm:flex-row sm:justify-between"}
    >
        <div className={"sm:w-[50%]"}>
            <h2>
                {article.title}
            </h2>
            <div className={"text-[var(--text-light)] text-sm"}>
                {formatIsoDate(article.created_at)}
            </div>
        </div>
        <div className={"sm:w-[40%] sm:text-base text-sm text-[var(--text-light)]"}>
            <CardStat label={"Lectores"} value={rounder(article.seenBy)}/>
            <CardStat label={"Lectura promedio"} value={(article.avgReadFraction * 100).toFixed(2) + "%"}/>
            <CardStat
                label={"Ingresos"}
                value={"$" + article.income.toFixed(2)}
            />
        </div>
    </Link>
}


const EditStatsCard = ({topicVersion}: { topicVersion: EditedTopicStats }) => {
    return <Link
        href={topicUrl(topicVersion.topicId, undefined, "normal")}
        className={"hover:bg-[var(--background-dark3)] p-4 rounded-lg bg-[var(--background-dark2)] mx-2 flex flex-col sm:flex-row sm:justify-between"}
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
                info={"El porcentaje de los caracteres agregados por vos en la historia del artículo. Entre paréntesis se muestra el porcentaje de las remuneraciones del tema que te corresponden, que puede no ser igual."}
                moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}
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

    function optionsNodes(o: string, isSelected: boolean) {

        return <div
            className="text-[var(--text)]"
        >
            <Button
                variant="text"
                color="background-dark"
                sx={{
                    paddingY: 0,
                    borderTopLeftRadius: o == "Artículos" ? "8px" : 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"whitespace-nowrap sm:text-[15px] text-[16px] min-[500px]:mx-4 pb-1 mx-2 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}
                >
                    {o}
                </div>
            </Button>
        </div>
    }

    const isAuthor = enabledOptions.length > 0

    return <div className={"flex flex-col"}>
        <PageHeader title={"Panel de autor"}/>
        {isLoading && <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>}
        {!data && !isLoading && <div className={"py-16 text-center text-[var(--text-light)]"}>
            Ocurrió un error al cargar los datos.
        </div>}
        {data && !isAuthor && <div className={"text-[var(--text-light)] text-center py-16 px-4"}>
            Escribí tu primer artículo o editá un tema para convertirte en autor.
        </div>}
        {data && isAuthor && <div className={"pt-4 px-2 space-y-2 pb-32"}>
            <div className={"flex flex-wrap gap-2"}>
                <StatSquare label={"Artículos"} value={rounder(data.articles.length)}/>
                <StatSquare
                    label={"Temas editados"}
                    value={rounder(data.edits.length)}
                />
                <StatSquare
                    label={"Ingresos totales"}
                    value={"$" + data.totalIncome.toFixed(2)}
                    info={"Tus ingresos sumados de artículos y temas. Los ingresos de cada lectura se asignan cuando termina el mes de uso del lector. Solo cuentan como lectores las cuentas verificadas como personas."}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}
                />
                {data.totalReadByArticles != null && <StatSquare
                    label={"Lecturas en artículos"}
                    value={rounder(data.totalReadByArticles)}
                    info={"El total de lecturas de tus artículos. Solo cuentan como lectores las cuentas verificadas como personas."}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}

                />}
                {data.avgReadFractionArticles != null && <StatSquare
                    label={"Lectura promedio en artículos"}
                    value={(data.avgReadFractionArticles * 100).toFixed(2) + "%"}
                />}
                {data.totalReadByEdits != null && <StatSquare
                    label={"Lecturas en temas"}
                    value={rounder(data.totalReadByEdits)}
                    info={"El total de lecturas en temas que editaste. En cada tema se cuentan solo las lecturas desde tu primera edición. Solo cuentan como lectores las cuentas verificadas como personas."}
                    moreInfoHref={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}
                />}
            </div>
            <div className={"bg-[var(--background-dark)] rounded-lg"}>
                <SelectionComponent
                    onSelection={(v: string) => setSelected(v)}
                    options={["Artículos", "Ediciones"]}
                    optionsNodes={optionsNodes}
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