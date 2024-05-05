import Markdown from 'react-markdown'
import * as fs from "node:fs";
import parse from "html-react-parser";

export default async function Law({params}){
    const text = fs.readFileSync("public/ley/"+params.id+".txt", 'utf-8');
    const newlineText = text.replace(/\n/g, '<br />');
    return <div className="px-2 py-16">
        {parse(newlineText)}
    </div>
}