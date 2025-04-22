import {useState} from "react";
import {TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {InsertImagePayload} from "../../../../modules/ca-lexical-editor/src/plugins/ImagesPlugin";

export function InsertImageUriDialogBody ({
    onClick,
}: {
    onClick: (payload: InsertImagePayload) => void;
}) {
    const [src, setSrc] = useState('');

    const isDisabled = src === '';

    return <>
        <TextField
            label="URL"
            size={"small"}
            fullWidth={true}
            autoComplete="off"
            placeholder="ej. https://dominio.com/imagen.jpg"
            onChange={(e) => {setSrc(e.target.value)}}
            value={src}
            data-test-id="image-modal-url-input"
        />
        <Button
            sx={{textTransform: "none"}}
            variant="contained"
            disableElevation={true}
            disabled={isDisabled}
            onClick={() => onClick({altText: "", src})}>
            Aceptar
        </Button>
    </>
}