import { InsertImagePayload } from "./editor/plugins/ImagesPlugin";
import { InsertImageDialog } from "./insert-image-dialog";

export const AddImageButton = ({images, setImages, showModal}: {images: InsertImagePayload[], setImages: (images: InsertImagePayload[]) => void, showModal: any}) => {
    return <button
        onClick={() => {
        showModal('Insertar una imágen', (onClose: any) => (
            <InsertImageDialog
            onSubmit={(payload: InsertImagePayload) => {
                setImages([...images, payload])
                onClose()
            }}
            />
        ));
        }}
        disabled={images.length >= 4}
        type="button"
        title="Insertar imágen"
        className="toolbar-item spaced"
        aria-label="Insertar imágen">
        <i className="format image" />
    </button>
}