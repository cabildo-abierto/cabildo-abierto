import {
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR,
    BOLD_UNDERSCORE,
    CHECK_LIST,
    ElementTransformer,
    ITALIC_STAR,
    ITALIC_UNDERSCORE, ORDERED_LIST,
    QUOTE,
    STRIKETHROUGH, TextFormatTransformer,
    TextMatchTransformer,
    UNORDERED_LIST
} from "@lexical/markdown";
import {$createTextNode, $isParagraphNode, ElementNode, ParagraphNode} from "lexical";
import {IMAGE} from "./plugins/MarkdownTransformers/image-transformer";
import {HR} from "./plugins/MarkdownTransformers/hr-transformer";
import {TABLE} from "./plugins/MarkdownTransformers/table-transformer";
import {$createCustomLinkNode, CustomLinkNode} from "./nodes/CustomLinkNode";
import {$isLinkNode} from "@lexical/link";
import {$createHeadingNode, $isHeadingNode, HeadingNode, HeadingTagType} from "@lexical/rich-text";
import {encodeParentheses} from "./plugins/FloatingLinkEditorPlugin";


export const LINK: TextMatchTransformer = {
    dependencies: [CustomLinkNode],
    export: (node, exportChildren, exportFormat) => {
        if (!$isLinkNode(node)) {
            return null;
        }
        const title = node.getTitle();

        const textContent = exportChildren(node);

        const url = encodeParentheses(node.getURL())

        return title
            ? `[${textContent}](${url} "${title}")`
            : `[${textContent}](${url})`;
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


const createBlockNode = (
    createNode: (match: Array<string>) => ElementNode,
): ElementTransformer['replace'] => {
    return (parentNode, children, match) => {
        const node = createNode(match);
        node.append(...children);
        parentNode.replace(node);
        node.select(0, 0);
    };
};


export const HEADING: ElementTransformer = {
    dependencies: [HeadingNode],
    export: (node, exportChildren) => {
        if (!$isHeadingNode(node)) {
            return null;
        }
        const level = Number(node.getTag().slice(1));
        return '#'.repeat(level) + ' ' + exportChildren(node) + "\n";
    },
    regExp: /^(#{1,6})\s/,
    replace: createBlockNode((match) => {
        const tag = ('h' + match[1].length) as HeadingTagType;
        return $createHeadingNode(tag);
    }),
    type: 'element',
};

export type MarkdownTransformer = ElementTransformer | TextFormatTransformer | TextMatchTransformer

export const CA_TRANSFORMERS: MarkdownTransformer[] = [
    QUOTE,
    ORDERED_LIST,
    UNORDERED_LIST,
    CHECK_LIST,
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_UNDERSCORE,
    BOLD_STAR,
    ITALIC_STAR,
    ITALIC_UNDERSCORE,
    STRIKETHROUGH,
    HEADING,
    IMAGE,
    LINK,
    TABLE,
    HR,
    PARAGRAPH
]