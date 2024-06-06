import Markdown from 'react-markdown'
import * as fs from "node:fs";
import parse from "html-react-parser";

export default async function Law({params}){
    const text = fs.readFileSync("public/ley/"+params.id+".html", 'utf-8');
    return <div className="px-2 py-16">
        {parse(text)}
    </div>
}