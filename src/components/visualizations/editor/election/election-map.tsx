import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {Candidato, Cargo, ElectionPlotter, getProvinceName} from "./election-plotter";
import {DatasetForTableView, useDebounce} from "@/components/visualizations/datasets/dataset-table-view";
import React, {useMemo, useState} from "react";
import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "../../../../../modules/ui-utils/src/button";
import SearchIcon from "@mui/icons-material/Search";
import {CloseButton} from "../../../../../modules/ui-utils/src/close-button";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import {capitalize} from "@/utils/strings";
import {MemoizedArgentinaMap} from "@/components/visualizations/editor/election/argentina-map";
import { TextField } from "../../../../../modules/ui-utils/src/text-field";


const AlianzaPreview = ({nombre, onSelect}: {
    nombre: string
    onSelect: () => void
}) => {
    return <div
        onClick={onSelect}
        className={"hover:bg-[var(--background-dark)] cursor-pointer p-2 font-extralight border border-[var(--accent-dark)]"}
    >
        <div className={"flex justify-between"}>
            <div
                className={"capitalize font-extralight text-sm"}>
                {nombre.toLowerCase()}
            </div>
        </div>
    </div>
}


const Lista = ({cargo, subcargos, onSelectCandidate}: {
    cargo: Cargo
    subcargos: [Candidato[], Candidato[]]
    onSelectCandidate: (v: string) => void
}) => {
    const [open, setOpen] = useState(false)

    const filtrados = useMemo(() => {
        return subcargos
            .map(cs => cs.filter(x => x.cargo == cargo))
    }, [subcargos])

    const count = filtrados[0].length + filtrados[1].length
    const isEmpty = count == 0

    return <div
        className={"border border-[var(--accent-dark)] p-2 " + (isEmpty ? "" : "cursor-pointer")}
        onClick={() => {
            if (!isEmpty) setOpen(!open)
        }}
    >
        <div className={"flex justify-between"}>
            <div className={"text-[var(--text)] uppercase text-sm"}>
                {cargo}
            </div>
            {!isEmpty && (open ? <CaretUpIcon/> : <CaretDownIcon/>)}
        </div>
        {!open && <div className={"text-sm text-[var(--text-light)] font-extralight"}>
            {count} candidatos.
        </div>}
        {open && Array.from(filtrados).map((candidatos, j) => {
            return <div key={j}>
                <div className={"text-xs text-[var(--text-light)] font-semibold"}>
                    {j == 0 ? "Titulares" : "Suplentes"}
                </div>
                <div>
                    {candidatos.map((c, k) => {
                        return <div
                            key={k}
                            onClick={() => {
                                onSelectCandidate(c.nombre)
                            }}
                            className={"hover:text-[var(--text)] cursor-pointer capitalize text-xs text-[var(--text-light)]"}
                        >
                            {c.posicion != null ? c.posicion + "." : ""} {c.nombre.toLowerCase()}
                        </div>
                    })}
                </div>
            </div>
        })}
    </div>
}


const Alianza = ({
                     nombre, district, subcargos, onBack,
                     plotter, onSelectCandidate, onSelectAlianza, onSelectDistrict
                 }: {
    onBack: () => void
    nombre: string
    district: string
    subcargos: [Candidato[], Candidato[]]
    onSelectCandidate: (nombre: string) => void
    plotter: ElectionPlotter
    onSelectAlianza: (nombre: string, district: string) => void
    onSelectDistrict: (v: string) => void
}) => {

    const idTema = subcargos.length > 0 && subcargos[0].length > 0 ? subcargos[0][0].idTemaAlianza : null

    const districts = plotter.getDistrictsForAlianza(nombre).filter(x => x != district)

    return <div className={"p-2 mt-2 border border-[var(--accent-dark)]"}>
        <div className={"flex justify-between items-start"}>
            <div>
                <div className={"capitalize leading-tight text-lg font-extrabold"}>
                    {nombre.toLowerCase()}
                </div>
                <div className={"text-[var(--text-light)] cursor-pointer"} onClick={() => {
                    onSelectDistrict(district)
                }}>
                    {district}
                </div>
            </div>
            <CloseButton
                onClose={onBack}
                color={"transparent"}
                size={"small"}
            />
        </div>
        <div className={"space-y-2 mt-2"}>
            {["Diputados", "Senadores"].map((cargo: Cargo) => {
                return <div
                    key={cargo}
                >
                    <Lista
                        cargo={cargo}
                        subcargos={subcargos}
                        onSelectCandidate={onSelectCandidate}
                    />
                </div>
            })}
        </div>
        {idTema && <div className={"flex justify-end mt-2 text-sm font-extralight"}>
            <TopicLinkButton id={idTema}/>
        </div>}
        <div className={"text-xs mt-2 text-[var(--text-light)] font-extralight"}>
            {districts.length > 0 && <>
                Esta alianza también está en los distritos {districts.map((p, i) => {
                return <span
                    key={p}
                    className={"cursor-pointer hover:text-[var(--text)]"}
                    onClick={() => {
                        onSelectAlianza(nombre, p)
                    }}
                >
                    {p + (i != districts.length - 1 ? ", " : "")}
                </span>
            })}.
            </>}
            {districts.length == 0 && <>
                Esta alianza no está en ningún otro distrito.
            </>}
        </div>
    </div>
}

const Distrito = ({distrito, plotter, onSelectAlianza}: {
    distrito: string,
    plotter: ElectionPlotter
    onSelectAlianza: (nombre: string, distrito: string) => void
}) => {

    const [cargo, setCargo] = useState<Cargo>("Diputados")

    const candidatos = plotter
        .getCandidatesForDistrict(distrito, cargo)

    const idDistrito = plotter.getDistrictTopicId(distrito)

    function optionsNodes(o: Cargo, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                size={"small"}
                sx={{height: "20px"}}
                variant={"outlined"}
                color={isSelected ? "background-dark" : "background"}
            >
                <span className={"text-xs"}>{o}</span>
            </Button>
        </div>
    }

    return <div className={"border border-[var(--accent-dark)] p-2 mt-2"}>
        <div className={"truncate text-xl font-extrabold py-1"}>
            {getProvinceName(distrito)}
        </div>
        <div className="flex space-x-2">
            <SelectionComponent<Cargo>
                onSelection={setCargo}
                selected={cargo}
                options={["Diputados", "Senadores"]}
                optionsNodes={optionsNodes}
                optionContainerClassName={"flex"}
                className={"flex space-x-1"}
            />
        </div>
        <div className={"overflow-y-auto pt-2 custom-scrollbar"}>
            <div className={"space-y-1"}>
                {candidatos && candidatos.size == 0 && <div className={"text-[var(--text-light)] text-xs"}>
                    No se eligen {cargo} en esta provincia.
                </div>}
                {candidatos && Array.from(candidatos)
                    .map(([alianza, subcargos], subcargo) => {
                        return <div key={subcargo}>
                            <AlianzaPreview
                                onSelect={() => {
                                    onSelectAlianza(alianza, distrito)
                                }}
                                nombre={alianza}
                            />
                        </div>
                    })
                }
            </div>

            {idDistrito && <div className={"flex justify-end mt-1"}>
                <TopicLinkButton id={idDistrito}/>
            </div>}
        </div>
    </div>
}


const TopicLinkButton = ({id}: {id: string}) => {
    return <Link
        className={"border uppercase text-xs border-[var(--accent-dark)] px-2 cursor-pointer hover:bg-[var(--background-dark)]"}
        target={"_blank"}
        href={topicUrl(capitalize(id), undefined, "normal")}
    >
        Tema
    </Link>
}


const CandidateComp = ({nombre, plotter, onBack, onSelectProvince, onSelectAlianza}: {
    nombre: string
    plotter: ElectionPlotter
    onBack: () => void
    onSelectAlianza: (v: string, district: string) => void
    onSelectProvince: (v: string) => void
}) => {

    const candidato = plotter.getCandidate(nombre)

    return <div className={"mt-2 border border-[var(--accent-dark)] p-2"}>
        <div className={"flex justify-between items-start space-x-2"}>
            <div className={"capitalize font-extrabold text-lg"}>
                {nombre.toLowerCase()}
            </div>
            <CloseButton onClose={onBack} size={"small"} color={"background"}/>
        </div>
        <div className={"font-extralight text-sm "}>
            <div>
                <span className={"text-[var(--text-light)]"}>Alianza:</span> <span
                className={"capitalize cursor-pointer"}
                onClick={() => {
                    onSelectAlianza(candidato.alianza, candidato.distrito)
                }}>
                {candidato.alianza.toLowerCase()}</span>.
            </div>
            <div>
                <span className={"text-[var(--text-light)]"}>Posición:</span> <span
                className={""}>{candidato.posicion != null ? `${candidato.posicion}°` : ""} {candidato.subcargo.toLowerCase()}</span>.
            </div>
            <div>
                <span className={"text-[var(--text-light)]"}>Postulado a:</span> <span
                className={"capitalize"}>{candidato.cargo.toLowerCase()}</span>.
            </div>
            <div>
                <span className={"text-[var(--text-light)]"}>Distrito:</span> <span
                className={"capitalize cursor-pointer"} onClick={() => {
                onSelectProvince(candidato.distrito)
            }}>{candidato.distrito.toLowerCase()}</span>.
            </div>
            {candidato.idTema && <div className={"flex justify-end mt-1"}>
                <TopicLinkButton id={candidato.idTema}/>
            </div>}
        </div>
    </div>
}


const SearchResults = ({searchValue, plotter, onSelectCandidate, onSelectAlianza, setSearchValue}: {
    searchValue: string
    plotter: ElectionPlotter
    onSelectCandidate: (c: string) => void
    onSelectAlianza: (c: string, distrito: string) => void
    setSearchValue: (v: string | null) => void
}) => {
    const debouncedSearchValue = useDebounce(searchValue, 100)

    const searchResults = useMemo(() => {
        if (debouncedSearchValue) return plotter.getSearchResults(debouncedSearchValue)
        return null
    }, [debouncedSearchValue])

    return <div>
        {searchResults && searchResults.length == 0 &&
            <div className={"text-xs text-[var(--text-light)] pt-4 text-center"}>
                Sin resultados
            </div>}
        {searchResults != null && <div>
            {searchResults.length > 0 && <div className={"space-y-1 pt-2 overflow-y-auto custom-scrollbar"}>
                {searchResults.slice(0, 10).map((r, i) => {
                    return <div
                        key={i}
                        onClick={() => {
                            if (r.type == "alianza") {
                                onSelectAlianza(r.nombre, r.distrito)
                            } else if (r.type == "candidato") {
                                onSelectCandidate(r.candidato.nombre)
                            }
                            setSearchValue(null)
                        }}
                        className={"border-[var(--accent-dark)] border cursor-pointer hover:bg-[var(--background-dark)] p-1 text-xs font-extralight text-[var(--text-light)]"}
                    >
                        {r.type == "candidato" && <div>
                            <div className={"capitalize font-semibold"}>
                                {r.candidato.nombre.toLowerCase()}
                            </div>
                            <div className={"text-[11px]"}>
                                {r.candidato.cargo} por <span className={"capitalize"}>
                                    {r.candidato.distrito.toLowerCase()}
                                    </span>
                            </div>
                        </div>}
                        {r.type == "alianza" && <div className={""}>
                            <div className={"font-semibold capitalize"}>
                                {r.nombre.toLowerCase()}
                            </div>
                            <div className={"text-[11px]"}>
                                Alianza en <span className={"capitalize"}>
                                    {r.distrito}
                                </span>
                            </div>
                        </div>}
                    </div>
                })}
                {searchResults.length > 10 && <div className={"text-xs font-extralight text-[var(--text-light)] pt-2"}>
                    Se muestran los primeros 10 resultados.
                </div>}
            </div>}
        </div>}
    </div>
}


type Props = {
    spec: $Typed<ArCabildoabiertoEmbedVisualization.Eleccion>
    visualization: ArCabildoabiertoEmbedVisualization.View
    dataset: DatasetForTableView
    width?: number
    height?: number
}

type Selection = {
    kind: "Distrito",
    nombre: string
} | {
    kind: "Alianza",
    nombre: string,
    distrito: string
} | {
    kind: "Candidato",
    nombre: string
}

export const ElectionMap = ({
                                spec,
                                visualization,
                                dataset,
                                width,
                                height
                            }: Props) => {
    const [selectionStack, setSelectionStack] = useState<Selection[]>([])
    const [searchValue, setSearchValue] = useState("")

    const {plotter, error} = useMemo(() => {
        const plotter = new ElectionPlotter(
            spec,
            dataset
        )
        const {error} = plotter.prepareForPlot()
        if (error) return {error}
        return {plotter}
    }, [JSON.stringify(dataset.columns), JSON.stringify(spec)])

    if (error) {
        return <div className={"text-center text-[var(--text-light)] text-sm py-32 flex items-center justify-center"}>
            {error}
        </div>
    }

    const selected = selectionStack.length > 0 ? selectionStack[selectionStack.length - 1] : null

    let district: string
    if (selected && selected.kind == "Distrito") district = selected.nombre
    if (selected && selected.kind == "Candidato") district = plotter.getCandidate(selected.nombre).distrito
    if (selected && selected.kind == "Alianza") district = selected.distrito

    function setSelected(s: Selection) {
        setSelectionStack([...selectionStack, s])
    }

    function onBack() {
        setSelectionStack([...selectionStack.slice(0, selectionStack.length - 1)])
    }

    function onSelectDistrict(p: string) {
        setSelected({
            kind: "Distrito",
            nombre: p
        })
    }

    const rightWidth = Math.max((width - 8) * 0.4, 200)
    const leftWidth = width - rightWidth - 8

    return <div
        className={"flex not-article-content exclude-links space-x-1"}
        style={{width, height}}
    >
        <MemoizedArgentinaMap
            selectedProvince={district}
            onSelectProvince={onSelectDistrict}
            height={height}
            width={leftWidth}
        />
        <ElectionMapSidepanel
            setSelected={setSelected}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            onBack={onBack}
            selected={selected}
            plotter={plotter}
            width={rightWidth}
        />
    </div>
}


const ElectionMapSidepanel = ({
                                  setSelected,
                                  selected,
                                  setSearchValue,
                                  searchValue,
                                  onBack,
                                  plotter,
                                  width,
                                  height
                              }: {
    selected: Selection
    setSelected: (s: Selection) => void
    searchValue: string
    setSearchValue: (v: string) => void
    onBack: () => void
    plotter: ElectionPlotter
    width?: number
    height?: number
}) => {

    function onSelectDistrict(p: string) {
        setSelected({
            kind: "Distrito",
            nombre: p
        })
    }

    function onSelectAlianza(p: string, distrito: string) {
        setSelected({
            kind: "Alianza",
            nombre: p,
            distrito: distrito
        })
    }

    function onSelectCandidate(c: string) {
        setSelected({
            kind: "Candidato",
            nombre: c
        })
    }

    return useMemo(() => <div
        style={{width, height}}
        className={"overflow-y-auto custom-scrollbar border border-[var(--accent-dark)] p-2"}
    >
        <TextField
            variant="outlined"
            value={searchValue ?? ""}
            onChange={(e) => {
                setSearchValue(e.target.value)
            }}
            slotProps={{
                input: {
                    startAdornment: <span className={"text-[var(--text-light)] mr-1 text-sm"}>
                        <SearchIcon fontSize="inherit" color={"inherit"}/></span>,
                }
            }}
            paddingY={0.5}
            fontSize={13}
            fullWidth={true}
            placeholder={"buscar candidatos o alianzas..."}
        />

        <div>
            {selected && selected.kind == "Distrito" && !searchValue && <Distrito
                distrito={selected.nombre}
                plotter={plotter}
                onSelectAlianza={onSelectAlianza}
            />}
            {!selected && !searchValue && <div className={"text-[var(--text-light)] text-xs pt-4"}>
                Seleccioná una provincia o buscá un candidato o alianza.
            </div>}
            {searchValue && <SearchResults
                plotter={plotter}
                searchValue={searchValue}
                onSelectAlianza={onSelectAlianza}
                onSelectCandidate={onSelectCandidate}
                setSearchValue={setSearchValue}
            />}
            {selected && selected.kind == "Alianza" && !searchValue && <Alianza
                nombre={selected.nombre}
                district={selected.distrito}
                subcargos={plotter.getAlianza(selected.nombre, selected.distrito)}
                onSelectCandidate={onSelectCandidate}
                onSelectDistrict={onSelectDistrict}
                onSelectAlianza={onSelectAlianza}
                onBack={onBack}
                plotter={plotter}
            />}
            {selected && selected.kind == "Candidato" && !searchValue && <CandidateComp
                nombre={selected.nombre}
                plotter={plotter}
                onSelectProvince={onSelectDistrict}
                onSelectAlianza={onSelectAlianza}
                onBack={onBack}
            />}
        </div>
    </div>, [JSON.stringify(plotter.dataset.columns), JSON.stringify(plotter.electionSpec), selected, searchValue])
}


