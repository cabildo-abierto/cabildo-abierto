import {
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR, BOLD_UNDERSCORE, CHECK_LIST,
    ElementTransformer,
    HEADING, INLINE_CODE, ITALIC_STAR, ITALIC_UNDERSCORE,
    ORDERED_LIST,
    QUOTE, STRIKETHROUGH, TextMatchTransformer,
    UNORDERED_LIST
} from "@lexical/markdown";
import {$createTextNode, $isParagraphNode, ParagraphNode} from "lexical";
import {IMAGE} from "./plugins/MarkdownTransformers/image-transformer";
import {HR} from "./plugins/MarkdownTransformers/hr-transformer";
import {TABLE} from "./plugins/MarkdownTransformers/table-transformer";
import {$createCustomLinkNode, CustomLinkNode} from "./nodes/CustomLinkNode";
import {$isLinkNode} from "@lexical/link";


export const PARAGRAPH: ElementTransformer = {
    dependencies: [ParagraphNode],
    export: (node, exportChildren) => {
        if (!$isParagraphNode(node)) {
            return null;
        }

        const content = exportChildren(node)
        return `\n${content}\n`
    },
    regExp: /(?!)/,
    replace: (parentNode, children, _match, isImport) => {
        return
    },
    type: 'element',
};


export const LINK: TextMatchTransformer = {
    dependencies: [CustomLinkNode],
    export: (node, exportChildren, exportFormat) => {
        if (!$isLinkNode(node)) {
            return null;
        }
        const title = node.getTitle();

        const textContent = exportChildren(node);

        const linkContent = title
            ? `[${textContent}](${node.getURL()} "${title}")`
            : `[${textContent}](${node.getURL()})`;

        return linkContent;
    },
    importRegExp:
        /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
    regExp:
        /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
    replace: (textNode, match) => {
        const [, linkText, linkUrl, linkTitle] = match;

        const http = linkUrl.startsWith("https://") || linkUrl.startsWith("http://")
        const cabildo = linkUrl.startsWith("https://www.cabildoabierto.com.ar") || linkUrl.startsWith("https://cabildoabierto.com.ar")
        const isExternal = http && !cabildo

        const linkNode = $createCustomLinkNode(linkUrl, {
            title: linkTitle,
            ...(isExternal && { target: "_blank" }),
        })

        const linkTextNode = $createTextNode(linkText)
        linkTextNode.setFormat(textNode.getFormat())
        linkNode.append(linkTextNode)
        textNode.replace(linkNode)

        return linkTextNode
    },
    trigger: ')',
    type: 'text-match',
};


export const CA_TRANSFORMERS = [
    QUOTE,
    HEADING,
    ORDERED_LIST,
    UNORDERED_LIST,
    CHECK_LIST,
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR,
    BOLD_UNDERSCORE,
    INLINE_CODE,
    ITALIC_STAR,
    ITALIC_UNDERSCORE,
    STRIKETHROUGH,
    IMAGE,
    LINK,
    TABLE,
    HR
]