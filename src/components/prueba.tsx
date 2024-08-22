
"use client"

import { getContentById } from "@/actions/get-content";
import { findReferences } from "@/actions/create-content";

export const Prueba = () => {
    return <button onClick={async () => {
        const text = await getContentById("cm01to9le0009148pt9uv6w1u")
        if(text){
            const refs = await findReferences(text.text)
        }
    }}>Prueba</button>
}