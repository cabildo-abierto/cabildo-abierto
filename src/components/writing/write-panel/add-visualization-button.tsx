import VisualizationsIcon from "@mui/icons-material/AutoGraph";
import { IconButton } from "../../../../modules/ui-utils/src/icon-button";


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
        sx={{
            borderRadius: 0
        }}
        title="Nueva visualización"
        aria-label="Nueva visualización"
    >
        <VisualizationsIcon fontSize={"small"} color={"inherit"}/>
    </IconButton>
}