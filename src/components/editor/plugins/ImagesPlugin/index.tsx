/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import {useEffect, useRef, useState} from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import {$isImageNode, ImageNode, $createImageNode, ImagePayload} from '../../nodes/ImageNode';

import Button from '@mui/material/Button'
import {styled, TextField} from '@mui/material'
import {DialogActions, DialogButtonsList} from '../../ui/Dialog';
import FileInput from '../../ui/FileInput';
import { CAN_USE_DOM } from '../../shared/canUseDOM';
import { createClient } from '../../../../utils/supabase/client';

import { v4 as uuidv4 } from 'uuid';

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND');

export function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState('');

  const isDisabled = src === '';

  return <>
      <TextField
        label="URL"
        size={"small"}
        fullWidth={true}
        autoComplete="off"
        placeholder="ej. https://dominio.com/imagen.jpg"
        onChange={(e) => {setSrc(e.target.value)}}
        value={src}
        data-test-id="image-modal-url-input"
      />
      <Button
          sx={{textTransform: "none"}}
          variant="contained"
          disableElevation={true}
          disabled={isDisabled}
          onClick={() => onClick({altText: "", src})}>
          Aceptar
      </Button>
  </>
}


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});



export const UploadImageButton = ({onSubmit}: {onSubmit: (i: InsertImagePayload) => void}) => {
    const loadImage = async (e) => {
        if (e.target.files !== null) {
            const file = e.target.files[0];
        
            const uniqueId = uuidv4()
            const extension = file.type.split('/')[1]; 
            const filename = `${uniqueId}.${extension}`;
        
            const supabase = createClient();
            
            const { error } = await supabase.storage
              .from('pictures')
              .upload('public/' + filename, file);
        
            if (error) {
              console.error('Error al cargar el archivo:', error);
              return;
            }
        
            const { data: publicUrlData } = supabase.storage
              .from('pictures')
              .getPublicUrl('public/' + filename);
        
            if (publicUrlData?.publicUrl) {
              onSubmit({src: "/media/"+filename, altText: ""});
            }
        }
    }

    return <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      sx={{textTransform: "none"}}
      disableElevation={true}
      startIcon={<CloudUploadIcon />}
      fullWidth={true}
    >
      Subir archivo
      <VisuallyHiddenInput
        type="file"
        onChange={loadImage}
        multiple={false}
      />
    </Button>
}


export function InsertImageUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState('');

  const isDisabled = src === '';

  const loadImage = async (files: FileList | null) => {
    if (files !== null) {
      const file = files[0];
  
      const uniqueId = uuidv4()
      const extension = file.type.split('/')[1]; 
      const filename = `${uniqueId}.${extension}`;
  
      const supabase = createClient();
      
      const { error } = await supabase.storage
        .from('pictures')
        .upload('public/' + filename, file);
  
      if (error) {
        console.error('Error al cargar el archivo:', error);
        return;
      }
  
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl('public/' + filename);
  
      if (publicUrlData?.publicUrl) {
        setSrc("/media/"+filename);
      }
    }
  };

  return (
    <>
      <FileInput
        label="Subir imágen"
        onChange={loadImage}
        accept="image/*"
        data-test-id="image-modal-file-upload"
      />
      <DialogActions>
        <Button
          variant="contained"
          disableElevation={true}
          disabled={isDisabled}
          sx={{textTransform: "none"}}
          onClick={() => onClick({altText: "", src})}>
          Aceptar
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<null | 'url' | 'file'>(null);
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [activeEditor]);

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    onClose();
  };

  return (
    <div className="max-w-screen flex flex-col items-center">
      <div className="w-48">
      {!mode && (
        <DialogButtonsList>
          <Button
            variant="contained"
            sx={{textTransform: "none"}}
            disableElevation={true}
            onClick={() => setMode('url')}>
            Desde un URL
          </Button>
          <UploadImageButton
            onSubmit={onClick}
          />
        </DialogButtonsList>
      )}
      </div>
      {mode === 'url' && <InsertImageUriDialogBody onClick={onClick} />}
      {mode === 'file' && <InsertImageUploadedDialogBody onClick={onClick} />}
    </div>
  );
}

export default function ImagesPlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;

  function $onDragStart(event: DragEvent): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
      return false;
    }
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) {
      return false;
    }
    dataTransfer.setData('text/plain', '_');
    dataTransfer.setDragImage(img, 0, 0);
    dataTransfer.setData(
      'application/x-lexical-drag',
      JSON.stringify({
        data: {
          altText: node.__altText,
          caption: node.__caption,
          height: node.__height,
          key: node.getKey(),
          maxWidth: node.__maxWidth,
          showCaption: node.__showCaption,
          src: node.__src,
          width: node.__width,
        },
        type: 'image',
      }),
    );

    return true;
  }

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload)
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [captionsEnabled, editor]);

  return null;
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const {type, data} = JSON.parse(dragData);
  if (type !== 'image') {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
