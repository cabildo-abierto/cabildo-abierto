import {useState} from "react";
import {Button} from "../../../layout/utils/button";
import {PropValueType} from "@/components/topics/topic/utils";
import 'dayjs/locale/es';
import {BaseFullscreenPopup} from "../../../layout/utils/base-fullscreen-popup";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import { Select } from "../../../layout/utils/select";
import SearchableDropdown from "@/components/layout/utils/searchable-dropdown";
import {useAPI} from "@/queries/utils";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";


const propLexicons = [
    "ar.cabildoabierto.wiki.topicVersion#stringProp",
    "ar.cabildoabierto.wiki.topicVersion#stringListProp",
    "ar.cabildoabierto.wiki.topicVersion#dateProp",
    "ar.cabildoabierto.wiki.topicVersion#numberProp",
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"
]

function getTopicPropDisplayName(o: string) {
    o = o.replace("ar.cabildoabierto.wiki.topicVersion#", "")
    if(o == "stringProp") return "Texto"
    if(o == "stringListProp") return "Lista de textos"
    if(o == "dateProp") return "Fecha"
    if(o == "numberProp") return "Número"
    if(o == "booleanProp") return "Sí/No"
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
        {!isLoading && <div className={"px-6 pb-6 space-y-4 flex flex-col items-center"}>
            <div className={"font-semibold"}>
                Nueva propiedad
            </div>
            <div className={"text-sm text-[var(--text-light)] max-w-[300px]"}>
                Agregá una característica del tema.
                Si muchos temas tienen la misma propiedad, se puede hacer una visualización con ellos. <Link
                href={topicUrl("Cabildo Abierto: Wiki", undefined, "normal")}
                target={"_blank"}
                className={"hover:underline font-semibold"}
            >
                Más información.
            </Link>
            </div>
            <SearchableDropdown
                size={"small"}
                options={knownProps.map(c => c.name)}
                selected={name}
                onChange={(e) => {
                    if(knownProps) {
                        const known = knownProps.find(p => p.name == e)
                        if(known != null) {
                            setDataType(known.type)
                        }
                    }
                    setName(e)
                }}
                label={"Nombre de la propiedad"}
            />
            <Select
                fontSize={"14px"}
                options={propLexicons}
                optionLabels={(o: string) => {
                    return getTopicPropDisplayName(o)
                }}
                label={"Tipo de propiedad"}
                backgroundColor={"background"}
                value={dataType}
                onChange={(e) => {setDataType(e as PropValueType)}}
            />
            <Button size={"small"} onClick={() => {
                cleanAndClose();
                onAddProp(name, dataType)
            }} disabled={name.length == 0}>
                Aceptar
            </Button>
        </div>}
    </BaseFullscreenPopup>
}
