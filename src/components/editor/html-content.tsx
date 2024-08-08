import parse from "html-react-parser"
import "./styles.css"

export default function HtmlContent({content, limitHeight=false}: {content: string, limitHeight?: Boolean}) {
    if(limitHeight){
        return <div className="max-h-40 overflow-hidden overflow-y-auto ck-content">{parse(content)}</div>
    } else {
        return <div className="">{parse(content)}</div>
    }
}