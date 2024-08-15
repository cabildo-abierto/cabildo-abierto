
  
import './index.css';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
KEY_ESCAPE_COMMAND,
} from 'lexical';
import {useEffect} from 'react';
  
export function EscapeHandlerPlugin({
  onEscape,
}: {
  onEscape: (e: KeyboardEvent) => boolean;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event: KeyboardEvent) => {
        return onEscape(event);
      },
      2,
    );
  }, [editor, onEscape]);

  return null;
}