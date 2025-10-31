import {useState} from "react";
import {BaseButton} from "../../../layout/base/baseButton";
import {PropValueType} from "@/components/topics/topic/utils";
import 'dayjs/locale/es';
import {BaseFullscreenPopup} from "../../../layout/base/base-fullscreen-popup";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import BaseTextFieldWithSuggestions from "@/components/layout/base/base-text-field-with-suggestions";
import {useAPI} from "@/queries/utils";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import BaseSelect from "@/components/layout/base/base-select";
import {Note} from "@/components/layout/utils/note";


const propLexicons = [
    "ar.cabildoabierto.wiki.topicVersion#stringProp",
    "ar.cabildoabierto.wiki.topicVersion#stringListProp",
    "ar.cabildoabierto.wiki.topicVersion#dateProp",
    "ar.cabildoabierto.wiki.topicVersion#numberProp",
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"
]

function getTopicPropDisplayName(o: string) {
    o = o.replace("ar.cabildoabierto.wiki.topicVersion#", "")
    if (o == "stringProp") return "Texto"
    if (o == "stringListProp") return "Lista de textos"
    if (o == "dateProp") return "Fecha"
    if (o == "numberProp") return "Número"
    if (o == "booleanProp") return "Sí/No"
    throw Error(`Propiedad desconocida: ${o}`)
}

type KnownProp = {
    name: string
    type: PropValueType
}

function useKnownProps() {
    return useAPI<KnownProp[]>("/known-props", ["known-props"])
}


export default function NewPropModal({open, onClose, onAddProp}: {
    open: boolean,
    onClose: () => void,
    onAddProp: (name: string, type: PropValueType) => void
}) {
    const [name, setName] = useState("")
    const [dataType, setDataType] = useState<PropValueType>("ar.cabildoabierto.wiki.topicVersion#stringProp")
    const {data: knownProps, isLoading} = useKnownProps()

    function cleanAndClose() {
        setName("")
        setDataType("ar.cabildoabierto.wiki.topicVersion#stringProp")
        onClose()
    }

    return <BaseFullscreenPopup open={open} onClose={cleanAndClose} closeButton={true}>
        {isLoading && <LoadingSpinner/>}
        {!isLoading && <div className={"px-6 pb-6 space-y-4 flex flex-col max-w-[360px]"}>
            <h3 className={"font-semibold uppercase text-sm"}>
                Nueva propiedad
            </h3>
            <Note className={"text-left"}>
                Agregá una característica del tema.
                Si muchos temas tienen la misma propiedad, se puede hacer una visualización con ellos. <Link
                href={topicUrl("Cabildo Abierto: Wiki", undefined, "normal")}
                target={"_blank"}
                className={"hover:underline font-semibold"}
            >
                Más información.
            </Link>
            </Note>
            <BaseTextFieldWithSuggestions
                options={knownProps.map(c => c.name)}
                value={name}
                onChange={(e) => {
                    if (knownProps) {
                        const known = knownProps.find(p => p.name == e)
                        if (known != null) {
                            setDataType(known.type)
                        }
                    }
                    setName(e)
                }}
                label={"Nombre de la propiedad"}
            />
            <BaseSelect
                contentClassName={"z-[1501]"}
                options={propLexicons}
                optionLabels={(o: string) => {
                    return getTopicPropDisplayName(o)
                }}
                label={"Tipo de propiedad"}
                value={dataType}
                onChange={(e) => {
                    setDataType(e as PropValueType)
                }}
            />
            <Note className={"text-left"}>
                Para agregar una imagen, elegí tipo texto y usá el URL de la imagen.
            </Note>
            <div className={"flex justify-end"}>
                <BaseButton
                    onClick={() => {
                        cleanAndClose();
                        onAddProp(name, dataType)
                    }}
                    size={"small"}
                    disabled={name.length == 0}
                    variant={"outlined"}
                >
                    Aceptar
                </BaseButton>
            </div>
        </div>}
    </BaseFullscreenPopup>
}
