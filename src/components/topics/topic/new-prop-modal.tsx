import {useState} from "react";
import {TextField} from "@mui/material";
import {Button} from "../../../../modules/ui-utils/src/button";
import {PropValueType} from "@/components/topics/topic/utils";
import 'dayjs/locale/es';
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {Select, MenuItem, FormControl, InputLabel} from "@mui/material";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";

export default function NewPropModal({open, onClose, onAddProp}: {
    open: boolean,
    onClose: () => void,
    onAddProp: (name: string, type: PropValueType) => void
}) {
    const [name, setName] = useState("")
    const [dataType, setDataType] = useState<PropValueType>("ar.cabildoabierto.wiki.topicVersion#stringProp")

    function cleanAndClose() {
        setName("")
        setDataType("ar.cabildoabierto.wiki.topicVersion#stringProp")
        onClose()
    }

    return <BaseFullscreenPopup open={open} onClose={cleanAndClose} closeButton={true}>
        <div className={"px-6 pb-6 space-y-4 flex flex-col items-center"}>
            <div className={"font-semibold"}>
                Nueva propiedad
            </div>
            <div className={"text-sm text-[var(--text-light)] max-w-[300px]"}>
                Agregá una característica del tema.
                Si muchos temas tienen la misma propiedad, se puede hacer una visualización con ellos. <Link
                href={topicUrl("Cabildo Abierto: Wiki (Temas)", undefined, "normal")}
                target={"_blank"}
                className={"hover:underline font-semibold"}
            >
                Más información.
            </Link>
            </div>
            <TextField
                size={"small"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label={"Nombre de la propiedad"}
                fullWidth
            />
            <FormControl fullWidth size="small">
                <InputLabel>Tipo de propiedad</InputLabel>
                <Select
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value as PropValueType)}
                    label="Tipo de propiedad"
                >
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#stringProp"}>Texto</MenuItem>
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#stringListProp"}>Lista de textos</MenuItem>
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#dateProp"}>Fecha</MenuItem>
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#numberProp"}>Número</MenuItem>
                    <MenuItem value={"ar.cabildoabierto.wiki.topicVersion#booleanProp"}>Sí/No</MenuItem>
                </Select>
            </FormControl>
            <Button size={"small"} onClick={() => {
                cleanAndClose();
                onAddProp(name, dataType)
            }} disabled={name.length == 0}>
                Aceptar
            </Button>
        </div>
    </BaseFullscreenPopup>
}
