import {ListView} from "../../../layout/utils/list-editor";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import Image from "next/image"
import {topicUrl} from "@/utils/uri";
import InfoPanel from "@/components/layout/utils/info-panel";


export function getDescriptionForProp(propName: string) {
    if (propName == "Categorías") {
        return {
            moreInfoHref: topicUrl("Cabildo Abierto: Wiki"),
            info: "Las categorías del tema. Al elegir una que no existe se crea automáticamente una nueva categoría."
        }
    } else if (propName == "Sinónimos") {
        return {
            info: "Palabras clave que se usan para detectar menciones al tema.",
            moreInfoHref: topicUrl("Cabildo Abierto: Wiki")
        }
    } else if (propName == "Título") {
        return {
            info: "El título del tema. Usá esta propiedad para cambiar su título.",
            moreInfoHref: topicUrl("Cabildo Abierto: Wiki")
        }
    }
    return {}
}

const TopicStringPropViewValue = ({name, value}: { name: string, value: string }) => {
    if (name == "Foto") {
        return <Image
            src={value}
            alt={name}
            width={400}
            height={400}
            className={"w-36 h-auto object-contain border border-[var(--accent-dark)]"}
        />
    } else {
        return <div className={"text-sm"}>{value}</div>
    }
}


export const TopicPropView = ({p}: { p: ArCabildoabiertoWikiTopicVersion.TopicProp }) => {
    if (p.name == "Título" || p.name == "Categorías") return null
    const {info, moreInfoHref} = getDescriptionForProp(p.name)

    return <div className={"flex flex-col space-y-[2px]"}>
        <div className={"flex space-x-1 items-center"}>
            <div className={"text-sm text-[var(--text-light)]"}>
                {p.name}
            </div>
            {info && <InfoPanel
                iconFontSize={15}
                text={info}
                moreInfoHref={moreInfoHref}
            />}
        </div>
        <div className={"break-words"}>
            {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListView
                items={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <TopicStringPropViewValue
                name={p.name}
                value={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value) && <div className={"text-sm"}>
                {p.value.value}
            </div>}
            {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) && <div className={"text-sm"}>
                {formatIsoDate(p.value.value, false)}
            </div>}
        </div>
    </div>
}