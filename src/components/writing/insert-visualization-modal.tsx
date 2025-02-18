"use client"
import SearchableDropdown from "../ui-utils/searchable-dropdown";
import {BaseFullscreenPopup} from "../ui-utils/base-fullscreen-popup";
import {getVisualizationTitle} from "../utils";
import {VisualizationProps} from "../../app/lib/definitions";
import {useVisualizations} from "../../hooks/contents";


export const InsertVisualizationModal = ({open, onClose, setVisualization}: {
    open: boolean
    onClose: () => void;
    setVisualization: (v: VisualizationProps) => void
}) => {
    const {visualizations} = useVisualizations()

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
                options={visualizations ? visualizations.map(({cid}) => (cid)) : []}
                optionViews={visualizations ? visualizations.map((v) => (getVisualizationTitle(v))) : []}
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