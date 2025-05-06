import VisualizationsIcon from "@mui/icons-material/AutoGraph";


export const AddVisualizationButton = ({
    disabled,
    setModalOpen
}: {
    disabled: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <button
        onClick={() => {
            setModalOpen(true)
        }}
        disabled={disabled}
        type="button"
        title="Nueva visualización"
        className="toolbar-item spaced text-[var(--text-light)]"
        aria-label="Nueva visualización">
        <VisualizationsIcon fontSize={"small"} color={"inherit"}/>
    </button>
}