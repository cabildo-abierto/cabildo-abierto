import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import InsertImageIcon from "@/components/utils/icons/insert-image-icon";

export const AddImageButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <BaseIconButton
        onClick={() => {setModalOpen(true)}}
        disabled={disabled}
        type="button"
        size={"default"}
        title="Insertar imágen"
        aria-label="Insertar imágen"
    >
        <InsertImageIcon fontSize={20}/>
    </BaseIconButton>
}