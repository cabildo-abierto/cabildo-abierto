import type {BlockType, TopicBlock} from "@cabildo-abierto/api";
import {DotsSixVerticalIcon} from "@phosphor-icons/react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";

function BlockTypeIcon({typeId}: {typeId: BlockType["id"]}) {
    if (typeId === "h1") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T1</span>;
    if (typeId === "h2") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T2</span>;
    return <span className="inline-flex size-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">P</span>;
}

export function TopicBlockEditForm({block, isNew, blockTypes, onChange, onDeleteEmpty}: {
    block: TopicBlock
    isNew: boolean
    blockTypes: BlockType[]
    onChange: (block: TopicBlock) => void
    onDeleteEmpty: () => void
}) {
    const changeType = (typeId: BlockType["id"] | null) => {
        if (!typeId) return;
        const content = typeId === "parrafo" ? block.content : block.content.replace(/[\r\n]+/g, " ");
        onChange({...block, typeId, content});
    };

    return <div className="relative -mx-3 space-y-3 px-3 py-2">
        {block.typeId === "parrafo" ? <Textarea
            value={block.content}
            onChange={event => onChange({...block, content: event.target.value})}
            onKeyDown={event => { if (event.key === "Backspace" && block.content === "") onDeleteEmpty(); }}
            placeholder="Escribí un párrafo..."
            className="min-h-0 mb-0 resize-none rounded-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
            maxLength={20_000}
            draggable={false}
            autoFocus
        /> : <Input
            value={block.content}
            onChange={event => onChange({...block, content: event.target.value})}
            onKeyDown={event => { if (event.key === "Backspace" && block.content === "") onDeleteEmpty(); }}
            placeholder={block.typeId === "h1" ? "Título de sección" : "Título de subsección"}
            className={cn("h-auto rounded-none border-0 bg-transparent mb-0 px-0 py-0 font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent", block.typeId === "h1" ? "text-xl md:text-xl" : "text-base md:text-base")}
            maxLength={20_000}
            draggable={false}
            autoFocus
        />}
        <span className="absolute top-2 right-full mr-2 inline-flex items-center gap-1 whitespace-nowrap text-[10px] text-muted-foreground">
            <DotsSixVerticalIcon className="size-4" aria-hidden="true"/>
            {!isNew && block.blockNumber}
            {isNew && <Select value={block.typeId} onValueChange={changeType}>
                <SelectTrigger className="h-6 w-12 cursor-pointer px-1" aria-label={`Tipo de bloque: ${blockTypes.find(type => type.id === block.typeId)?.name ?? block.typeId}`}>
                    <SelectValue><BlockTypeIcon typeId={block.typeId}/></SelectValue>
                </SelectTrigger>
                <SelectContent className="w-max min-w-48">
                    {blockTypes.map(type => <SelectItem key={type.id} value={type.id} className="cursor-pointer" aria-label={type.name} title={type.name}>
                        <BlockTypeIcon typeId={type.id}/>
                        <span>{type.name}</span>
                    </SelectItem>)}
                </SelectContent>
            </Select>}
        </span>
    </div>;
}
