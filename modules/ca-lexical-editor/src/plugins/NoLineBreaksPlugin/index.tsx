import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$createParagraphNode, $isParagraphNode, LineBreakNode} from 'lexical';
import {useEffect} from 'react';

export function NoLineBreaksPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerNodeTransform(LineBreakNode, (lineBreak: LineBreakNode) => {
            const parent = lineBreak.getParent()
            if($isParagraphNode(parent)) {
                const newParagraph = $createParagraphNode()
                const children = lineBreak.getNextSiblings()
                for(const c of children) {
                    c.remove()
                }
                newParagraph.append(...children)
                parent.insertAfter(newParagraph)
                lineBreak.remove()
                newParagraph.selectStart()
            }
        });
    }, [editor]);

    return null;
}
