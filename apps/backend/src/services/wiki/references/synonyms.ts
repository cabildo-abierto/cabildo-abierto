import {gett, unique} from "@cabildo-abierto/utils";
import {cleanText} from "@cabildo-abierto/utils";
import {AppContext} from "#/setup.js";
import {sql} from "kysely";


export type SynonymsMap = Map<string, { topics: Set<string>, regex: RegExp }>

function getSynonymRegex(synonym: string) {
    const escapedKey = cleanText(synonym).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return new RegExp(`\\b${escapedKey}\\b`, 'gi')
}

export async function getSynonymsToTopicsMap(
    ctx: AppContext, topicsList?: string[]
): Promise<SynonymsMap> {
    const synonymsSql = sql<unknown>`
        (SELECT p - > 'value' - > 'value'
         FROM jsonb_array_elements(
                  -- make sure we always hand an ARRAY to jsonb_array_elements
                      COALESCE(
                              CASE
                                  WHEN jsonb_typeof(tv.props) = 'array' THEN tv.props
                                  ELSE '[]'::jsonb
                                  END,
                              '[]' ::jsonb
                      )
              ) AS p
         WHERE p ->> 'name' = 'Sinónimos'
             LIMIT 1)
    `.as('synonyms')

    const select = ctx.kysely
        .selectFrom('Topic as t')

    const t1 = Date.now()
    const topics: {
        synonyms: unknown,
        id: string
    }[] = await (topicsList ? select.where("t.id", "in", topicsList) : select)
        .innerJoin('TopicVersion as tv', 't.currentVersionId', 'tv.uri')
        .select(['t.id', synonymsSql])
        .execute()

    const t2 = Date.now()
    ctx.logger.logTimes("get synonyms map 2", [t1, t2])

    const synonymsToTopicsMap: SynonymsMap = new Map()

    topics.forEach((t) => {
        const synList = t.synonyms instanceof Array ? t.synonyms as string[] : []
        const synonyms = unique(synList.map(cleanText))

        synonyms.forEach(s => {
            if (synonymsToTopicsMap.has(s)) {
                const cur = gett(synonymsToTopicsMap, s)
                cur.topics.add(t.id)
            } else {
                synonymsToTopicsMap.set(s, {topics: new Set([t.id]), regex: getSynonymRegex(s)})
            }
        })
    })

    return synonymsToTopicsMap
}