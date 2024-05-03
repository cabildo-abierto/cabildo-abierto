import ReactMarkdown from "react-markdown";
import { promises as fs } from 'fs';
import Discussion from "@/app/feed/discussion";
import React from "react";
import Markdown from "react-markdown";

const Articulo = ({index, content}) => {
    return <Markdown>{content}</Markdown>;
}

const Capitulo = ({index, content}) => {
    return <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="text-lg font-semibold mb-2">Capítulo {index + 1}</p>
            {content.map((articulo, index) => (
                <Articulo index={index} content={articulo}/>
            ))}
    </div>
}


const Titulo = ({ index, content }) => {
    return (
        <>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-lg font-semibold mb-2">Título {index + 1}</p>
                {content.map((capitulo, index) => (
                    <Capitulo index={index} content={capitulo}/>
                ))}
            </div>
        </>
    );
};

export default async function Page() {
    const file = await fs.readFile(process.cwd() + '/src/app/out.json', 'utf8');
    const data = JSON.parse(file);

    return <div className="mx-auto max-w-4xl bg-gray-200 p-4">
            <div>
                {data.titulos.map((str, index) => (
                    <Titulo index={index} content={str}/>

                ))}
            </div>
    </div>
}