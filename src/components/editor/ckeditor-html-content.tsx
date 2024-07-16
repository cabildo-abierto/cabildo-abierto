import parse from "html-react-parser"

import 'ckeditor5/ckeditor5.css';


export default function HtmlContent({content, limitHeight=false}) {
    if(limitHeight){
        return <div className="editor-container ck-content max-h-40 overflow-hidden overflow-y-auto">{parse(content)}</div>
    } else {
        return <div className="editor-container ck-content">{parse(content)}</div>
    }
}