import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import VisualizationIcon from "@/components/utils/icons/visualization-icon";


export const AddVisualizationButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {

    return <BaseIconButton
        onClick={() => {
            setModalOpen(true)
        }}
        disabled={disabled}
        size={"default"}
        title="Agregar visualización"
        aria-label="Agregar visualización"
    >
        <VisualizationIcon fontSize={20}/>
    </BaseIconButton>
}