import {InsertImageModal} from "@/components/writing/write-panel/insert-image-modal";
import {InsertImagePayload} from "../ImagesPlugin";
import {ImagePayload} from "@/components/writing/write-panel/write-post";

export type InsertImageNodeModalProps = {
    open: boolean
    onClose: () => void;
    onSubmit: (i: InsertImagePayload) => void;
}

export const InsertImageNodeModal = ({open, onClose, onSubmit}: InsertImageNodeModalProps) => {

    const onSubmitImage = (i: ImagePayload) => {
        const imageForNode: InsertImagePayload = {
            altText: "",
            src: i.src
        }
        onSubmit(imageForNode)
    }


    return <InsertImageModal
        open={open}
        onClose={onClose}
        onSubmit={onSubmitImage}
    />
}