import VisualizationsIcon from "@mui/icons-material/AutoGraph";


export const AddVisualizationButton = ({
                                           setVisualization, disabled, modalOpen, setModalOpen}: {
    setVisualization: (visualization: any) => void
    disabled: boolean
    modalOpen: boolean
    setModalOpen: (open: boolean) => void
}) => {
    return <button
        onClick={() => {
            setModalOpen(true)
        }}
        disabled={disabled}
        type="button"
        title="Insertar visualización"
        className="toolbar-item spaced text-[var(--text-light)]"
        aria-label="Insertar visualización">
        <VisualizationsIcon fontSize={"small"} color={"inherit"}/>
    </button>
}