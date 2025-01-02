"use client"
import SearchableDropdown from "../ui-utils/searchable-dropdown";
import {BaseFullscreenPopup} from "../ui-utils/base-fullscreen-popup";
import {useEffect, useState} from "react";
import {getVisualizations} from "../../actions/data";
import {getVisualizationTitle} from "../utils";


export const InsertVisualizationModal = ({open, onClose, setVisualization}: {
    open: boolean
    onClose: () => void;
    setVisualization: (v: string) => void
}) => {
    const [visualizations, setVisualizations] = useState([])

    useEffect(
        () => {
            async function fetchVisualizations(){
                if(visualizations.length == 0){
                    const v = await getVisualizations()
                    setVisualizations(v)
                }
            }

            fetchVisualizations();
        },
        []
    )

    return <BaseFullscreenPopup
        open={open}
        className={"w-96"}
        onClose={onClose} closeButton={true}
    >
        <div className={"flex flex-col items-center mb-16 px-6"}>
            <h2 className={"text-center mb-12"}>
                Insertar una visualización
            </h2>
            <SearchableDropdown
                options={visualizations.map(({cid}) => (cid))}
                optionViews={visualizations.map((v) => (getVisualizationTitle(v)))}
                onSelect={(v: string) => {
                    for(let i = 0; i < visualizations.length; i++) {
                        if(visualizations[i].cid == v) {
                            setVisualization(visualizations[i])
                            break
                        }
                    }
                    onClose()
                }}
                label={"Visualización"}
                size={"small"}
            />
        </div>
    </BaseFullscreenPopup>
}