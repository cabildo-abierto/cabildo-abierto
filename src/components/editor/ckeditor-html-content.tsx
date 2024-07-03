import parse from "html-react-parser"

import 'ckeditor5/ckeditor5.css';


export default function HtmlContent({content}) {
    return <div className="editor-container ck-content">{parse(content)}</div>
}