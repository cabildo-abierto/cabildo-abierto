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
    const [error, setError] = useState<string | null>(null);

    const isDisabled = src === '';

    function onClickAccept(){
        setError(null)
        if(src.startsWith("https://")){
            onClick({altText: "", src})
        } else {
            setError("Ingresá un dominio seguro (https://).")
        }
    }

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
            onClick={onClickAccept}
        >
            Aceptar
        </Button>
        <div className={"text-sm text-red-500 text-center"}>
            {error}
        </div>
    </>
}