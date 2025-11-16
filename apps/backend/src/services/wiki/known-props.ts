import {AppContext} from "#/setup.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";


export type PropValueType = "ar.cabildoabierto.wiki.topicVersion#stringListProp" |
    "ar.cabildoabierto.wiki.topicVersion#stringProp" |
    "ar.cabildoabierto.wiki.topicVersion#dateProp" |
    "ar.cabildoabierto.wiki.topicVersion#numberProp" |
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"

type KnownProp = {
    name: string
    type: PropValueType
}

export const getKnownPropsHandler: CAHandlerNoAuth<{}, KnownProp[]> = async (ctx, agent, params) => {
    return {
        data: await getKnownProps(ctx)
    }
}


async function getKnownProps(ctx: AppContext) {
    const props = await ctx.kysely
        .selectFrom("Topic")
        .innerJoin("TopicVersion", "TopicVersion.uri", "Topic.currentVersionId")
        .select([
            "TopicVersion.props"
        ])
        .execute()

    const res = new Map<string, PropValueType>()
    props.forEach(t => {
        const topicProps = t.props as ArCabildoabiertoWikiTopicVersion.TopicProp[]
        topicProps.forEach(p => {
            res.set(p.name, p.value.$type as PropValueType)
        })
    })

    return Array.from(res.entries()).map(e => {
        return {
            name: e[0],
            type: e[1]
        }
    })
}