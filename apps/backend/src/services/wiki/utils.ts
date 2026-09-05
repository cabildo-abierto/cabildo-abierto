

export type TopicPropBase = {id: string; value?: string | undefined}


export function getTopicCategories(propEntries?: TopicPropBase[]): string[] {
    return getTopicPropValue<string[]>("categorias", propEntries) ?? []
}


export function getTopicPropValue<T>(propId: string, props?: TopicPropBase[]): T | null {
    const p = props?.find(p => p.id === propId)
    return p && p.value ? JSON.parse(p.value) as T : null
}


export function getTopicTitle(topic: {id: string, propEntries?: TopicPropBase[]}): string {
    const t = getTopicPropValue<string>("titulo", topic.propEntries)
    return t ?? topic.id
}