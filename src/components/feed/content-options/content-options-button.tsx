import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton } from '@mui/material';
import {ATProtoStrongRef} from '@/lib/types';
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {ContentOptions} from "@/components/feed/content-options/content-options";


export const ContentOptionsButton = ({
    record,
    enDiscusion=false,
    showBluesky,
    setShowBluesky,
}: {
    record?: ATProtoStrongRef
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
}) => {
    const modal = (onClose: () => void) => (
        <div className="text-base border rounded bg-[var(--background-dark)] p-1">
            <ContentOptions
                record={record}
                onClose={onClose}
                enDiscusion={enDiscusion}
                showBluesky={showBluesky}
                setShowBluesky={setShowBluesky}
            />
        </div>
    )

    return <ModalOnClick modal={modal}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="inherit"
                size={"small"}
            >
                <MoreHorizIcon fontSize="inherit"/>
            </IconButton>
        </div>
    </ModalOnClick>
};