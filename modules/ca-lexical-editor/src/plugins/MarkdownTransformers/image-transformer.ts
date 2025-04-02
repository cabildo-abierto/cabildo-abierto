import {ElementTransformer, TextMatchTransformer} from "@lexical/markdown";
import {$createImageNode, $isImageNode, ImageNode} from "../../nodes/ImageNode";


export const IMAGE: TextMatchTransformer = {
    dependencies: [ImageNode],
    export: (node) => {
        console.log("image?", node, $isImageNode(node))
        if (!$isImageNode(node)) {
            return null;
        }

        return `![${node.getAltText()}](${node.getSrc()})`;
    },
    importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
    regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
    replace: (textNode, match) => {
        const [, altText, src] = match;
        const imageNode = $createImageNode({
            altText,
            maxWidth: 800,
            src,
        });
        textNode.replace(imageNode);
    },
    trigger: ')',
    type: 'text-match',
};