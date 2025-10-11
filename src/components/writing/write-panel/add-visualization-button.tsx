import { IconButton } from "../../layout/utils/icon-button";
import VisualizationIcon from "@/components/layout/icons/visualization-icon";


export const AddVisualizationButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <IconButton
        onClick={() => {
            setModalOpen(true)
        }}
        disabled={disabled}
        size={"small"}
        sx={{
            borderRadius: 0
        }}
        title="Agregar visualización"
        aria-label="Agregar visualización"
    >
        <VisualizationIcon fontSize={20}/>
    </IconButton>
}