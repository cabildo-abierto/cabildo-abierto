import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {IconButton, TextField} from "@mui/material";
import {useState} from "react";
import Link from "next/link";
import {FaExternalLinkAlt} from "react-icons/fa";
import {Authorship} from "@/components/feed/frame/content-top-row-author";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import {contentUrl} from "@/utils/uri";
import {getVisualizationTitle} from "../../visualizations/editor/get-spec";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";


export const InsertVisualizationModal = ({open, onClose, onSubmit}: {
    open: boolean
    onClose: () => void;
    onSubmit: (v: Visualization) => void
}) => {
    const [visualization, setVisualization] = useState<Visualization>();

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose} closeButton={false}
    >
        <div className="w-[500px] flex justify-between items-center">
            <h3 className={"flex-1 text-center"}>
                ¿Qué visualización querés armar?
            </h3>
            <CloseButton onClose={onClose}/>
        </div>



        <div className="w-96">

        </div>
    </BaseFullscreenPopup>
}