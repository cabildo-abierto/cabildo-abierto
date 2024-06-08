import { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css'; // Import Quill's CSS
import { Quill } from 'react-quill';

const QuillEditor = () => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
        const quill = new Quill(quillRef.current, {
            theme: 'snow',
            placeholder: 'Write something...',
        });
    }
  }, []);

  return <div ref={quillRef} />
};

export default QuillEditor;