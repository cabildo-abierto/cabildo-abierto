import {useState} from "react";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {BaseTextField} from "../../layout/base/base-text-field";
import {BaseButton} from "../../layout/base/baseButton";

export function InsertImageUriDialogBody({
                                             onClick,
                                             onCancel
                                         }: {
    onClick: (i: ImagePayload) => void;
    onCancel: () => void
}) {
    const [src, setSrc] = useState('');
    const [error, setError] = useState<string | null>(null);

    const isDisabled = src === '';

    function onClickAccept() {
        setError(null)
        if (src.startsWith("https://")) {
            onClick({src, $type: "url"})
        } else {
            setError("Ingresá un dominio seguro (https://).")
        }
    }

    return <div className={"px-8 pb-4 space-y-4"}>
        <BaseTextField
            label="URL"
            autoComplete="off"
            placeholder="ej. https://dominio.com/imagen.jpg"
            onChange={(e) => {
                setSrc(e.target.value)
            }}
            value={src}
            data-test-id="image-modal-url-input"
            error={error}
        />
        <div className={"flex justify-end space-x-2 items-center"}>
            <BaseButton size="small" onClick={onCancel}>
                Volver
            </BaseButton>
            <BaseButton
                variant="outlined"
                size={"small"}
                disabled={isDisabled}
                onClick={onClickAccept}
            >
                Aceptar
            </BaseButton>
        </div>
    </div>
}