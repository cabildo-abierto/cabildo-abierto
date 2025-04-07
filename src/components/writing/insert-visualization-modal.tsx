"use client"
import {BaseFullscreenPopup} from "../../../modules/ui-utils/src/base-fullscreen-popup";
import {VisualizationProps} from "@/lib/definitions";
import {useVisualizations} from "../../hooks/swr";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {IconButton, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import Link from "next/link";
import {FaExternalLinkAlt} from "react-icons/fa";
import {Authorship} from "../feed/content-top-row-author";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {contentUrl} from "../../utils/uri";
import {cleanText} from "../../utils/strings";
import {getVisualizationTitle} from "../visualizations/editor/get-spec";


const VisualizationPreviewOnSelector = ({visualization, onClick}: {
    visualization: VisualizationProps, onClick: () => void}) => {
    const title = getVisualizationTitle(visualization)

    return <div className={"py-1 border rounded px-2 cursor-pointer hover:bg-[var(--background-dark2)]"} onClick={onClick}>
        <div className={"flex justify-between space-x-1"}>
            <div className={"font-semibold text-[16px] break-all"}>
                {title}
            </div>
            <Link href={contentUrl(visualization.uri)} target={"_blank"} className={"text-[var(--text-light)]"} onClick={(e) => {e.stopPropagation()}}>
                <IconButton color={"inherit"}>
                    <FaExternalLinkAlt fontSize={12} color={"inherit"}/>
                </IconButton>
            </Link>
        </div>
        <div className={"text-sm truncate text-[var(--text-light)]"}>
            Publicada por <Authorship content={visualization} onlyAuthor={true}/>
        </div>
        <div className={"flex justify-end text-[var(--text-light)] text-sm"}>
            <DateSince date={visualization.createdAt}/>
        </div>
    </div>
}


export const InsertVisualizationModal = ({open, onClose, setVisualization}: {
    open: boolean
    onClose: () => void;
    setVisualization: (v: VisualizationProps) => void
}) => {
    const {visualizations} = useVisualizations()
    const [searchValue, setSearchValue] = useState<string>("");
    const [filteredVisualizations, setFilteredVisualizations] = useState<VisualizationProps[]>([])

    useEffect(() => {
        if(visualizations){
            const filtered = visualizations.filter((v) => {
                return cleanText(getVisualizationTitle(v)).includes(cleanText(searchValue))
            })
            setFilteredVisualizations(filtered)
        }
    }, [visualizations, searchValue])

    return <BaseFullscreenPopup
        open={open}
        className={"w-96"}
        onClose={onClose} closeButton={true}
    >
        <div className={"flex flex-col items-center mb-16 px-6"}>
            <h3 className={"text-center mb-6"}>
                Elegí una visualización
            </h3>
            <TextField
                value={searchValue}
                size={"small"}
                fullWidth={true}
                placeholder={"buscar"}
                onChange={(e) => {setSearchValue(e.target.value)}}
            />
            {visualizations ? <div className={"mt-4 space-y-1 h-[300px] overflow-y-scroll w-full"}>
                {filteredVisualizations.map((v, i) => {
                    return <div key={i}>
                        <VisualizationPreviewOnSelector visualization={v} onClick={() => {
                            setVisualization(v)
                            onClose()
                        }}/>
                    </div>
                })}
            </div> : <div className={"mt-8"}><LoadingSpinner/></div>}
        </div>
    </BaseFullscreenPopup>
}