import {InsertImagePayload} from "./editor/plugins/ImagesPlugin";

export const AddImageButton = ({
                                   images, disabled, setImages}: {
    images: InsertImagePayload[], disabled: boolean, setImages: (images: InsertImagePayload[]) => void
}) => {
    // TO DO: Reimplement
    function onSubmit(payload: InsertImagePayload) {
        setImages([...images, payload])
    }

    return <button
        onClick={() => {
        }}
        disabled={disabled}
        type="button"
        title="Insertar imágen"
        className="toolbar-item spaced"
        aria-label="Insertar imágen">
        <i className="format image" />
    </button>
}