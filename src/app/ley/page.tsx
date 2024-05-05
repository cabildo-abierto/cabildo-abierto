import Markdown from 'react-markdown'
import * as fs from "node:fs";
import parse from "html-react-parser";
import Link from "next/link";

const legislacionArgentina = [
    { ley: 'Constitución Nacional', description: '', href: '/ley/constitucion-nacional/pdf'},
    { ley: 'Ley bases', descripcion: 'Ley de bases y puntos de partida para la libertad de los argentinos', href: '/ley/ley-bases/txt' },
    // Agrega más leyes aquí según sea necesario
];

export default async function Law(){
    return <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4 ml-2">Legislación Argentina</h1>
        <ul className="divide-y divide-gray-200">
            {legislacionArgentina.map((ley, index) => (
                    <li key={index} className="py-4 px-2">
                        <Link href={ley.href}>
                        <h2 className="text-lg font-semibold">{ley.ley}</h2>
                        <p className="text-gray-600 italic">{ley.descripcion}</p>
                        </Link>
                    </li>
            ))}
        </ul>
    </div>
}