import {
    Alianza,
    Candidato,
    Cargo, Distrito,
    ElectionElement,
    ElectionPlotter
} from "./election-plotter";
import React, {useMemo, useState} from "react";
import {TopicLinkButton} from "./topic-link-button";
import {CandidatePreview} from "./distrito-comp";
import {ListCandidateAttr} from "./candidate";
import {CaretCircleRightIcon} from "@phosphor-icons/react";


const Lista = ({cargo, subcargos, onSelect}: {
    cargo: Cargo
    subcargos: [Candidato[], Candidato[]]
    onSelect: (v: ElectionElement) => void
}) => {
    const filtrados = useMemo(() => {
        return subcargos
            .map(cs => cs.filter(x => x.cargo == cargo))
    }, [subcargos])

    const count = filtrados[0].length + filtrados[1].length

    return <div
        className={"bg-[var(--background-dark)] border border-[var(--accent-dark)] p-2 max-h-[300px] overflow-y-auto custom-scrollbar"}
    >
        <div className={"flex justify-between"}>
            <div className={"text-[var(--text)] uppercase text-sm"}>
                {cargo}
            </div>
        </div>
        <div className={"text-sm text-[var(--text-light)] font-extralight"}>
            {count} candidatos.
        </div>
        {count > 0 && Array.from(filtrados).map((candidatos, j) => {
            return <div key={j}>
                <div className={"text-sm text-[var(--text-light)] font-semibold py-4"}>
                    {j == 0 ? "Titulares" : "Suplentes"}
                </div>
                <div className={"grid grid-cols-3 gap-5"}>
                    {candidatos.map((c, k) => {
                        return <div
                            key={k}
                            onClick={() => {
                                onSelect({type: "candidato", value: c})
                            }}
                            className={"hover:text-[var(--text)] flex items-start cursor-pointer capitalize text-xs text-[var(--text-light)]"}
                        >
                            <div className={""}>
                                <CandidatePreview
                                    c={c}
                                    onSelect={onSelect}
                                />
                            </div>

                        </div>
                    })}
                </div>
            </div>
        })}
    </div>
}


export const Propuestas = ({propuestas, preview = false}: {
    propuestas: string[]
    preview?: boolean
}) => {
    return <div
        className={"custom-scrollbar " + (preview ? "overflow-y-clip max-h-[80px]" : "max-h-[300px] overflow-y-auto custom-scrollbar")}>
        {propuestas ? propuestas.map((p, i) => {
            return <div
                key={i}
                className={"flex space-x-2 items-center"}
            >
                <div>
                    <CaretCircleRightIcon/>
                </div>
                <div className={"text-sm"}>
                    {p}
                </div>
            </div>
        }) : <div className={"text-sm flex space-x-1 font-light items-center text-[var(--text-light)]"}>
            No se cargaron propuestas.
        </div>}
    </div>
}


const AlianzaDistritoSelector = ({onSelect, alianza, plotter}: {
    onSelect: (v: Distrito) => void
    alianza: Alianza
    plotter: ElectionPlotter
}) => {
    const districts = plotter.getDistrictsForAlianza(alianza.nombre)

    return <div className={"flex flex-wrap text-sm gap-1"}>
        {districts.map((d, i) => {
            return <div
                key={d.nombre}
                className={"font-light cursor-pointer bg-[var(--background-dark)] hover:bg-[var(--background-dark2)] px-1 " + (d.nombre == alianza.distrito.nombre ? "bg-[var(--background-dark3)]" : "text-[var(--text-light)]")}
                onClick={() => {
                    onSelect(d)
                }}
            >
                {d.nombre}
            </div>
        })}
    </div>
}


export const AlianzaComp = ({
                                alianza,
                                plotter,
                                onSelect,
                                height,
                                width
                            }: {
    alianza: Alianza
    height: number
    plotter: ElectionPlotter
    onSelect: (e: ElectionElement) => void
    width: number
}) => {
    const [selectedDistrict, setSelectedDistrict] = useState<Distrito>(alianza.distrito)
    const subcargos = plotter.getCandidatosAlianza({...alianza, distrito: selectedDistrict})

    return <div
        onWheel={e => e.stopPropagation()}
        className={"px-6 pb-6 pt-2 space-y-2 overflow-y-scroll custom-scrollbar"}
        style={{height}}
    >
        <div className={"flex justify-between"}>
            <div className={"py-1 text-lg"}>
                {alianza.nombre}
            </div>
            {alianza.idTema && <div className={"flex justify-end mt-2 text-sm font-extralight"}>
                <TopicLinkButton
                    id={alianza.idTema}
                />
            </div>}
        </div>
        <div className={"space-y-2"}>
            <div>
                Propuestas
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                <Propuestas propuestas={alianza.propuestas}/>
            </div>
        </div>
        <div className={"space-y-2"}>
            <div>
                Partidos
            </div>
            <div className={"text-[var(--text-light)] text-sm"}>
                <ListCandidateAttr value={alianza.partidos}/>
            </div>
        </div>
        <div>
            Candidatos
        </div>
        <AlianzaDistritoSelector
            plotter={plotter}
            alianza={alianza}
            onSelect={(d: Distrito) => {
                setSelectedDistrict(d)
            }}
        />
        <div className={"gap-2 grid mt-2 " + (width >= 800 ? "grid-cols-2" : "grid-cols-1")}>
            {["Diputados", "Senadores"].map((cargo: Cargo) => {
                return <div
                    key={cargo}
                    className={"w-full"}
                >
                    <Lista
                        cargo={cargo}
                        subcargos={subcargos}
                        onSelect={onSelect}
                    />
                </div>
            })}
        </div>
    </div>
}