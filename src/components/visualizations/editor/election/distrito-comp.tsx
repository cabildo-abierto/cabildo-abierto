import {
    Alianza,
    Candidato,
    Distrito, ElectionElement,
    ElectionPlotter
} from "@/components/visualizations/editor/election/election-plotter";
import Image from "next/image"
import React from "react";
import {BaseButton} from "@/components/layout/base/baseButton";
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import {TopicLinkButton, TopicMentionsLinkButton} from "@/components/visualizations/editor/election/topic-link-button";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import {Propuestas} from "@/components/visualizations/editor/election/alianza";


export const CandidateProfilePic = ({
                                        c,
                                        width = 80,
                                        height = 80,
                                        border = false
                                    }: {
    c: Candidato
    width?: number
    height?: number
    border?: boolean
}) => {
    if (c.foto) {
        return <div className={"flex justify-center items-center"} style={{height, width}}>
            <Image
                src={c.foto}
                width={width}
                height={height}
                alt={`foto de ${c.nombre}`}
                style={{width, height}}
                className={(border ? "border" : "") + " block object-cover"}
            />
        </div>
    } else {
        return <div
            style={{width, height}}
            className={(border ? "border" : "") + " lowercase text-sm text-[var(--text-light)] flex justify-center items-center font-light"}
        >
            <div>
                sin foto
            </div>
        </div>
    }
}


export const CandidatePreview = ({c, onSelect}: {
    c: Candidato,
    onSelect: (e: ElectionElement) => void
}) => {

    return <div
        onClick={() => {
            onSelect({
                type: "candidato",
                value: c
            })
        }}
        className={"cursor-pointer flex flex-col items-center justify-start"}
    >
        <div className={"hover:bg-[var(--background-dark2)]"}>
            <CandidateProfilePic
                c={c}
                border={true}
                width={80}
                height={80}
            />
            <div
                className={"w-20 text-center text-xs font-light break-words border-l border-r border-b capitalize p-[2px]"}>
                {c.nombre.toLowerCase()}
            </div>
        </div>
    </div>
}


const ViewMoreButton = ({onClick}: {
    onClick: () => void
}) => {
    return <BaseButton
        size={"small"}
        variant={"outlined"}
        onClick={onClick}
    >
        Ver más
    </BaseButton>
}


export const TopicRepliesCount = ({elem}: {
    elem: ElectionElement
}) => {
    return elem.value.replyCount != null && <BaseIconButton
        size={"small"}
    >
        <Link className={"flex"} href={topicUrl(elem.value.idTema) + "#discusion"}>
            <InactiveCommentIcon
                color={`var(--text-light)`}
                fontSize={18}
            />
            <div className={"pt-1 text-xs font-light text-[var(--text-light)]"}>
                {elem.value.replyCount}
            </div>
        </Link>
    </BaseIconButton>
}


const CardAlianza = ({
                         alianza,
                         diputados,
                         senadores,
                         plotter,
                         onSelect
                     }: {
    alianza: Alianza
    diputados: [Candidato[], Candidato[]]
    senadores?: [Candidato[], Candidato[]]
    plotter: ElectionPlotter
    onSelect: (e: ElectionElement) => void
}) => {
    const districts = plotter.getDistrictsForAlianza(alianza.nombre)

    const onSelectAlianza = () => {
        onSelect({
            type: "alianza",
            value: alianza
        })
    }

    return <div className={"panel-dark portal group p-2 h-full"}>
        <div className={"flex justify-between pb-2"}>
            {alianza.foto ? <Image
                width={64}
                height={64}
                src={alianza.foto}
                alt={"logo fuerza patria"}
                className={"w-16 h-16"}
            /> : <div
                className={"w-16 h-16 border text-xs flex justify-center items-center font-light text-[var(--text-light)]"}>
                sin logo
            </div>}
            <div className={"space-y-1 flex flex-col"}>
                <div className={"flex space-x-2 justify-end items-center"}>
                    <TopicRepliesCount elem={{type: "alianza", value: alianza}}/>
                    <TopicLinkButton id={alianza.idTema}/>
                </div>
                <div className={"flex flex-wrap gap-1 justify-end"}>
                    {districts.length > 1 && <BaseButton
                        onClick={onSelectAlianza}
                        size={"small"}
                        variant={"outlined"}
                    >
                    <span className={"text-xs"}>
                        {districts.length} distritos
                    </span>
                    </BaseButton>}
                    {alianza.partidos && <BaseButton
                        onClick={onSelectAlianza}
                        size={"small"}
                        variant={"outlined"}
                    >
                        {alianza.partidos.length} partidos
                    </BaseButton>}
                </div>
            </div>
        </div>
        <h4 className={""}>
            {alianza.nombre}
        </h4>
        <div className={"space-y-4 pt-2"}>
            <div className={"space-y-2"}>
                <div className={"font-semibold"}>
                    Propuestas
                </div>
                <Propuestas propuestas={alianza.propuestas} preview={true}/>
                {alianza.propuestas && alianza.propuestas.length > 3 && <ViewMoreButton
                    onClick={onSelectAlianza}
                />}
            </div>
            <div className={"flex flex-wrap gap-4"}>
                <div className={"space-y-2"}>
                    <div className={"font-semibold"}>
                        Diputados
                    </div>
                    <div className={"flex space-x-2"}>
                        <CandidatePreview
                            c={diputados[0][0]}
                            onSelect={onSelect}
                        />
                        <CandidatePreview
                            c={diputados[0][1]}
                            onSelect={onSelect}
                        />
                    </div>
                </div>
                {senadores && <div className={"space-y-2"}>
                    <div className={"font-semibold"}>
                        Senadores
                    </div>
                    <div className={"flex space-x-2"}>
                        <CandidatePreview
                            c={senadores[0][0]}
                            onSelect={onSelect}
                        />
                        <CandidatePreview
                            c={senadores[0][1]}
                            onSelect={onSelect}
                        />
                    </div>
                </div>}
            </div>
            <ViewMoreButton
                onClick={onSelectAlianza}
            />
        </div>
    </div>
}


export const DistritoComp = ({
                                 district,
                                 plotter,
                                 onSelect,
                                 width,
                                 height
                             }: {
    district: Distrito
    plotter: ElectionPlotter
    onSelect: (v: ElectionElement) => void
    width: number
    height: number
}) => {
    const diputados = plotter.getCandidatesForDistrict(district.nombre, "Diputados")
    const senadores = plotter.getCandidatesForDistrict(district.nombre, "Senadores")

    function orderAlianzas(a: [string, [Candidato[], Candidato[]]], b: [string, [Candidato[], Candidato[]]]) {
        return plotter.countDataAvailable(b[0]) - plotter.countDataAvailable(a[0])
    }

    const alianzas = Array.from(diputados.entries())

    return <div
        onWheel={e => e.stopPropagation()}
        className={"w-full px-2 overflow-y-auto custom-scrollbar"} style={{width, height}}>
        <div className={"flex items-center justify-between space-x-2"}>
            <div className={(width > 400 ? "text-sm" : "text-xs") + " text-[var(--text-light)] font-light py-2"}>
                <span>{alianzas.length} alianzas en el distrito.</span> {district.cantSenadores != null && district.cantSenadores > 0 &&
                <span>Se eligen {district.cantDiputados} diputados y {district.cantSenadores} senadores.</span>}{district.cantSenadores != null && district.cantSenadores == 0 &&
                <span>Se eligen {district.cantDiputados} diputados.</span>}
            </div>
            <div className={"flex space-x-2 items-center"}>
                <TopicLinkButton id={district.idTema}/>
                <TopicMentionsLinkButton id={district.idTema}/>
                <TopicRepliesCount elem={{type: "distrito", value: district}}/>
            </div>
        </div>
        <div className={"grid gap-5 w-full pb-2 " + (width >= 600 ? "grid-cols-2" : "grid-cols-1")}>
            {alianzas.toSorted(orderAlianzas).map(([nombreAlianza, candidates], i) => {
                const alianza = candidates[0][0].alianza
                return <div key={alianza.nombre} className={"w-full"}>
                    <CardAlianza
                        plotter={plotter}
                        alianza={alianza}
                        diputados={candidates}
                        senadores={senadores.get(alianza.nombre)}
                        onSelect={onSelect}
                    />
                </div>
            })}
        </div>
    </div>
}