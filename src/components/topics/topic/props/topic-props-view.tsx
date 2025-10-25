import {ListEditor} from "../../../layout/utils/list-editor";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import Image from "next/image"


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
        return <div className={""}>{value}</div>
    }
}


export const TopicPropView = ({p}: { p: ArCabildoabiertoWikiTopicVersion.TopicProp }) => {
    return <div className={"flex space-x-8 w-full items-center"}>
        <div className={"w-1/3"}>
            {p.name}
        </div>
        <div className={"w-2/3 break-all"}>
            {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
                items={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <TopicStringPropViewValue
                name={p.name}
                value={p.value.value}
            />}
            {ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value) && <div className={""}>
                {p.value.value}
            </div>}
            {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) && <div className={""}>
                {formatIsoDate(p.value.value, false)}
            </div>}
        </div>
    </div>
}