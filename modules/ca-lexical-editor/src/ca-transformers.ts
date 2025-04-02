import {
    BOLD_ITALIC_STAR,
    BOLD_ITALIC_UNDERSCORE,
    BOLD_STAR, BOLD_UNDERSCORE, CHECK_LIST,
    CODE, ElementTransformer,
    HEADING, INLINE_CODE, ITALIC_STAR, ITALIC_UNDERSCORE, LINK,
    ORDERED_LIST,
    QUOTE, STRIKETHROUGH,
    UNORDERED_LIST
} from "@lexical/markdown";
import {$isParagraphNode, ParagraphNode} from "lexical";
import {IMAGE} from "./plugins/MarkdownTransformers/image-transformer";
import {HR} from "./plugins/MarkdownTransformers/hr-transformer";
import {TABLE} from "./plugins/MarkdownTransformers/table-transformer";


export const PARAGRAPH: ElementTransformer = {
    dependencies: [ParagraphNode],
    export: (node, exportChildren) => {
        if (!$isParagraphNode(node)) {
            return null;
        }

        const content = exportChildren(node);
        console.log("Found paragraph node!")
        console.log("content is", content)
        return `\n${content}\n`
    },
    regExp: /(?!)/,
    replace: (parentNode, children, _match, isImport) => {
        return
    },
    type: 'element',
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