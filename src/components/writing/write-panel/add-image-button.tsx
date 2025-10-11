import { IconButton } from "../../layout/utils/icon-button";
import InsertImageIcon from "@/components/layout/icons/insert-image-icon";

export const AddImageButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <IconButton
        onClick={() => {setModalOpen(true)}}
        disabled={disabled}
        type="button"
        size={"small"}
        title="Insertar imágen"
        aria-label="Insertar imágen"
        sx={{
            borderRadius: 0
        }}
    >
        <InsertImageIcon fontSize={20}/>
    </IconButton>
}