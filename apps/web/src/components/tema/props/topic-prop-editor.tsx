import {isKnownProp} from "../utils";
import 'dayjs/locale/es';
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {defaultPropValue} from "@/components/tema/props/topic-props-editing-panel";


export function addDefaults(props: ArCabildoabiertoWikiTopicVersion.TopicProp[], topicId: string): ArCabildoabiertoWikiTopicVersion.TopicProp[] {
    if (!props) props = []
    const newProps: ArCabildoabiertoWikiTopicVersion.TopicProp[] = []
    for (let i = 0; i < props.length; i++) {
        const p = props[i]
        const valid = ArCabildoabiertoWikiTopicVersion.validateTopicProp(p)
        if (!valid.success) {
            if (isKnownProp(p.value)) {
                newProps.push({
                    ...p,
                    value: defaultPropValue(p.name, p.value.$type, topicId)
                })
            }
        } else {
            newProps.push(p)
        }
    }
    if (!props.some(p => p.name == "Título")) {
        newProps.push({
            name: "Título",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringProp", value: topicId}
        })
    }
    if (!props.some(p => p.name == "Categorías")) {
        newProps.push({
            name: "Categorías",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: []}
        })
    }
    if (!props.some(p => p.name == "Sinónimos")) {
        newProps.push({
            name: "Sinónimos",
            value: {$type: "ar.cabildoabierto.wiki.topicVersion#stringListProp", value: []}
        })
    }
    return newProps
}