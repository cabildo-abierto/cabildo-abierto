import {ATProtoStrongRef} from "@/lib/definitions";
import {ContentOptions} from "./content-options";


export const ContentOptionsDropdown = ({
    onClose,
    record,
    onDelete=async () => {},
    enDiscusion
}: {
    onClose: () => void
    record: ATProtoStrongRef
    onDelete: () => Promise<void>
    enDiscusion: boolean
}) => {
    return (
        <div className="text-base border rounded bg-[var(--background-dark)] p-1">
            <ContentOptions record={record} onClose={onClose} onDelete={onDelete} enDiscusion={enDiscusion}/>
        </div>
    )
}