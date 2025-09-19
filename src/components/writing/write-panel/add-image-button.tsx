import {ImageOutlined} from "@mui/icons-material";
import { IconButton } from "../../../../modules/ui-utils/src/icon-button";

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
        title="Insertar imágen"
        aria-label="Insertar imágen"
        sx={{
            borderRadius: 0
        }}
    >
        <ImageOutlined fontSize={"small"} color={"inherit"}/>
    </IconButton>
}