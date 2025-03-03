import Button from "@mui/material/Button";
import { InsertImageUriDialogBody, UploadImageButton } from "../editor/plugins/ImagesPlugin";
import { DialogButtonsList } from "../editor/ui/Dialog";
import { LinkIcon } from "../icons/link-icon";
import { useState } from "react";

export function InsertVisualizationDialog({
                                      onSubmit,
                                  }: {
    onSubmit: (payload: any) => void;
}): JSX.Element {
    const [mode, setMode] = useState<null | 'url' | 'file'>(null);

    return (
        <div className="max-w-screen flex flex-col items-center z-50">
            <div className="w-48">
                {!mode && (
                    <DialogButtonsList>
                        <Button
                            variant="contained"
                            sx={{textTransform: "none"}}
                            disableElevation={true}
                            startIcon={<LinkIcon/>}
                            onClick={() => setMode('url')}>
                            Desde un URL
                        </Button>
                        <UploadImageButton
                            onSubmit={onSubmit}
                        />
                    </DialogButtonsList>
                )}
            </div>
            {mode === 'url' && <InsertImageUriDialogBody onClick={onSubmit} />}
        </div>
    );
}