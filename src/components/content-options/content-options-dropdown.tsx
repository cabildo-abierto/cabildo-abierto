import {RecordProps} from "../../app/lib/definitions";
import {ContentOptions} from "./content-options";


export const ContentOptionsDropdown = ({
    onClose,
    record
}: {
    onClose: () => void
    record?: RecordProps
}) => {
    return <div className="text-base border rounded bg-[var(--content)] p-2">
        {record && <ContentOptions record={record} onClose={onClose}/>}
    </div>
}