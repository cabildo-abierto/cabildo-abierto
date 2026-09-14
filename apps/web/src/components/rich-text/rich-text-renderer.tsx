import Link from "next/link";
import {Fragment, type ReactNode} from "react";
import {parseRichTextContent, type RichTextMark} from "@cabildo-abierto/utils";
import {ArrowSquareOutIcon} from "@phosphor-icons/react";

function markedText(text: string, marks: RichTextMark[], linksEnabled: boolean, showExternalLinkIcon: boolean, isExternalLinkEnd: boolean): ReactNode {
    return marks.reduceRight<ReactNode>((children, mark) => {
        if (mark.type === "bold") return <strong>{children}</strong>;
        if (mark.type === "italic") return <em>{children}</em>;
        if (mark.type === "internal_link") return linksEnabled
            ? <Link href={`/tema/${encodeURIComponent(mark.attrs.topicId)}`} className="underline underline-offset-2">{children}</Link>
            : <span className="underline underline-offset-2">{children}</span>;
        return linksEnabled
            ? <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{children}{showExternalLinkIcon && isExternalLinkEnd && <ArrowSquareOutIcon className="ml-0.5 inline size-3 align-baseline" aria-hidden="true"/>}</a>
            : <span className="underline underline-offset-2">{children}{showExternalLinkIcon && isExternalLinkEnd && <ArrowSquareOutIcon className="ml-0.5 inline size-3 align-baseline" aria-hidden="true"/>}</span>;
    }, text);
}

function externalHref(node: {type: string; marks?: RichTextMark[]} | undefined): string | null {
    if (node?.type !== "text") return null;
    return node.marks?.find(mark => mark.type === "external_link")?.attrs.href ?? null;
}

export function RichTextRenderer({content, linksEnabled, showExternalLinkIcon = linksEnabled, footnoteNumbers}: {
    content: string
    linksEnabled: boolean
    showExternalLinkIcon?: boolean
    footnoteNumbers?: ReadonlyMap<string, number>
}) {
    const richText = parseRichTextContent(content);
    if (!richText) return content;
    const nodes = richText.doc.content[0].content ?? [];
    let localFootnoteNumber = 0;
    return nodes.map((node, index) => {
        if (node.type === "hard_break") return <br key={index}/>;
        if (node.type === "footnote") {
            localFootnoteNumber += 1;
            const number = footnoteNumbers?.get(node.attrs.id) ?? localFootnoteNumber;
            return <sup key={node.attrs.id} id={`footnote-ref-${node.attrs.id}`} title={node.attrs.content}>
                {footnoteNumbers
                    ? <a href={`#footnote-${node.attrs.id}`} className="ml-0.5 font-medium no-underline hover:underline">{number}</a>
                    : <span className="ml-0.5 font-medium">{number}</span>}
            </sup>;
        }
        return <Fragment key={index}>{markedText(node.text, node.marks ?? [], linksEnabled, showExternalLinkIcon, externalHref(node) !== externalHref(nodes[index + 1]))}</Fragment>;
    });
}
