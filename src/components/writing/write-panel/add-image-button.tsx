import { BaseIconButton } from "../../layout/base/base-icon-button";
import InsertImageIcon from "@/components/layout/icons/insert-image-icon";

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