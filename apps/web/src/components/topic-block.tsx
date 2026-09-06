import type {TopicBlock} from "@cabildo-abierto/api";

export function TopicBlockContent({block}: {block: TopicBlock}) {
    if (block.typeId === "h1") return <h2 className="text-xl font-semibold">{block.content}</h2>;
    if (block.typeId === "h2") return <h3 className="text-lg font-semibold">{block.content}</h3>;
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{block.content}</p>;
}

export function TopicBlockView({block}: {block: TopicBlock}) {
    return <article className="py-2">
        <TopicBlockContent block={block}/>
    </article>;
}
