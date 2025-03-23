import {RecordProps} from "../../app/lib/definitions";
import {ContentOptions} from "./content-options";


export const ContentOptionsDropdown = ({
    onClose,
    record,
    onDelete=async () => {}
}: {
    onClose: () => void
    record?: RecordProps
    onDelete: () => Promise<void>
}) => {
    return <div className="text-base border rounded bg-[var(--background)] p-1">
        {record && <ContentOptions record={record} onClose={onClose} onDelete={onDelete}/>}
    </div>
}