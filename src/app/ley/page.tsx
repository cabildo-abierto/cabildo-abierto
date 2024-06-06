import Markdown from 'react-markdown'
import * as fs from "node:fs";
import parse from "html-react-parser";
import Link from "next/link";
import fsPromises from 'fs/promises';

import path from 'path'

export default async function Law(){
    return <></>

    return <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4 ml-2">Legislación Argentina</h1>
        <ul className="divide-y divide-gray-200">
            {leyes.map((ley, index) => (
                    <li key={index} className="py-4 px-2">
                        <Link href={""}>
                        <h2 className="text-lg font-semibold">{ley.titulo_resumido}</h2>
                        <p className="text-gray-600 italic">{ley.numero_norma}</p>
                        </Link>
                    </li>
            ))}
        </ul>
    </div>
}