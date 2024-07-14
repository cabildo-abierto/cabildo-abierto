"use client"

import dynamic from 'next/dynamic';

const Editor = dynamic(
    () => import('./editor'),
    { ssr: false }
);


export default function Page() {
    return <>
        <div>
            Hola
        </div>
        <Editor/>
    </>
}

