import {ImageOutlined} from "@mui/icons-material";

export const AddImageButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <button
        onClick={() => {setModalOpen(true)}}
        disabled={disabled}
        type="button"
        title="Insertar imágen"
        className="toolbar-item spaced text-[var(--text-light)]"
        aria-label="Insertar imágen"
    >
        <ImageOutlined fontSize={"small"} color={"inherit"}/>
    </button>
}