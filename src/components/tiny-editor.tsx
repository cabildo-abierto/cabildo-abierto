import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export function TinyEditor({value="", onEditorChange=() => {}, initialValue=""}) {
  const editorRef = useRef(null);

  const toolbar = 'undo redo | bold italic underline bullist numlist link ulink table charmap emoticons removeformat preview'

  return (
    <>
      <Editor
        value={value}
        tinymceScriptSrc='/tinymce/tinymce.min.js'
        onInit={(_evt, editor) => editorRef.current = editor}
        initialValue={initialValue}
        init={{
          min_height: 300,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link',
            'table', 'preview', 'wordcount', 'autoresize', 'charmap', 'emoticons', 'quickbars'
          ],
          link_title: false,
          link_target_list: false,
          toolbar: toolbar,
          branding: false,
          language: 'es',
          quickbars_image_toolbar: true,
          quickbars_insert_toolbar: false,
          quickbars_selection_toolbar: false,
          content_style: 'body { font-family:Roboto; font-smoothing: antialiased; font-size:16px }'
        }}
        onEditorChange={onEditorChange}
      />
    </>
  );
}


export function ReadOnlyTinyEditor({initialValue=""}) {
  const editorRef = useRef(null);

  const toolbar = ''

  return (
    <>
      <Editor
        disabled={true}
        tinymceScriptSrc='/tinymce/tinymce.min.js'
        onInit={(_evt, editor) => editorRef.current = editor}
        initialValue={initialValue}
        init={{
          menubar: false,
          plugins: ["autoresize"],
          link_title: false,
          link_target_list: false,
          toolbar: toolbar,
          branding: false,
          language: 'es',
          quickbars_image_toolbar: false,
          quickbars_insert_toolbar: false,
          quickbars_selection_toolbar: false,
          autoresize_bottom_margin: 0,
        }}
      />
    </>
  );
}