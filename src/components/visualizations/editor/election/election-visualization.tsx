import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {ElectionElement, ElectionPlotter, getProvinceName} from "./election-plotter";
import {DatasetForTableView} from "@/components/visualizations/datasets/dataset-table-view";
import React, {useMemo, useState} from "react";
import {BackButton} from "@/components/layout/utils/back-button";

import {MemoizedArgentinaMap} from "@/components/visualizations/editor/election/argentina-map";

import {DistritoComp} from "@/components/visualizations/editor/election/distrito-comp";
import {TopicData} from "@/components/visualizations/editor/election/election-visualization-comp";
import {SearchResults} from "@/components/visualizations/editor/election/search-results";
import SearchBar from "@/components/buscar/search-bar";
import {CandidateComp} from "@/components/visualizations/editor/election/candidate";
import {AlianzaComp} from "@/components/visualizations/editor/election/alianza";


type Props = {
    spec: $Typed<ArCabildoabiertoEmbedVisualization.Eleccion>
    visualization: ArCabildoabiertoEmbedVisualization.View
    dataset: DatasetForTableView
    width?: number
    height?: number
    topicsData: TopicData[]
}


export const ElectionVisualization = ({
                                          spec,
                                          visualization,
                                          dataset,
                                          width,
                                          height,
                                          topicsData
                                      }: Props) => {
    const [searchValue, setSearchValue] = useState("")
    const [selectionStack, setSelectionStack] = useState<(ElectionElement)[]>([])

    const {plotter, error} = useMemo(() => {
        const plotter = new ElectionPlotter(
            spec,
            dataset,
            topicsData
        )
        const {error} = plotter.prepareForPlot()
        if (error) return {error}
        return {plotter}
    }, [JSON.stringify(dataset.columns), JSON.stringify(spec), topicsData])

    if (error) {
        return <div className={"text-center text-[var(--text-light)] text-sm py-32 flex items-center justify-center"}>
            {error}
        </div>
    }

    const selected = selectionStack.length > 0 ? selectionStack[selectionStack.length - 1] : null

    function setSelected(s: ElectionElement) {
        setSelectionStack([...selectionStack, s])
        setSearchValue("")
    }

    function onBack() {
        setSearchValue("")
        const newStack = [...selectionStack.slice(0, selectionStack.length - 1)]

        setSelectionStack(newStack)
    }

    const backgroundColor = "background-dark"

    return <div
        className={"not-article-content relative exclude-links"}
        style={{width, height}}
    >
        <div className={"absolute top-2 right-2 flex items-center " + (width < 800 ? "w-32" : "w-64")}>
            <SearchBar
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={"Buscar..."}
                size={"small"}
                paddingY={"4px"}
                paddingX={"8px"}
                fontSize={13}
                fullWidth={true}
            />
        </div>
        <div className={"flex space-x-2 items-start pt-2 w-full px-2 h-12"}>
            {selected && <div>
                <BackButton
                    size={"small"}
                    onClick={onBack}
                />
            </div>}
            <div className={"font-semibold text-lg truncate"} style={{maxWidth: width < 800 ? width-128-30-25 : width-256-30-35}}>
                {selected && <span className={"capitalize"}>{selected.value.nombre.toLowerCase()}</span>}
                {!selected && <span className={"pl-1"}>
                    Elegí un distrito
                </span>}
            </div>
        </div>
        {searchValue && <SearchResults
            searchValue={searchValue}
            plotter={plotter}
            onSelect={setSelected}
            setSearchValue={setSearchValue}
        />}
        {!selected && !searchValue && <MemoizedArgentinaMap
            selectedProvince={null}
            onSelectProvince={(p: string) => {
                const d = plotter.getDistrict(getProvinceName(p))
                setSelected({type: "distrito", value: d})
            }}
            height={height - 48}
            width={width}
        />}
        {!searchValue && selected && selected.type == "distrito" && <DistritoComp
            district={selected.value}
            plotter={plotter}
            onSelect={setSelected}
            width={width}
            height={height - 48}
            backgroundColor={backgroundColor}
        />}
        {!searchValue && selected && selected.type == "candidato" && <CandidateComp
            c={selected.value}
            height={height - 48}
        />}
        {!searchValue && selected && selected.type == "alianza" && <AlianzaComp
            alianza={selected.value}
            height={height - 48}
            onSelect={setSelected}
            plotter={plotter}
            backgroundColor={backgroundColor}
            width={width}
        />}
    </div>
}