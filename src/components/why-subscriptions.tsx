"use client"

import Link from "next/link"
import { Desplegable } from "./desplegable"
import { ExpandLessIcon, ExpandMoreIcon } from "./icons"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';


export const WhySubscriptions = () => {
    const whySubscriptions = <div className="text-sm sm:text-base flex flex-col justify-center mt-4 lg:w-96 w-64 link space-y-2 rounded-xl bg-[#d4eeca] p-4">
        <div className="space-y-2 text-gray-800">
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>La plataforma y sus autores son financiadas únicamente por sus usuarios.</p>
            </div>
            
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>El 70% de tu suscripción se reparte entre los autores de los contenidos que te interesen (vos también podés ser autor/a).</p>
            </div>
            
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>El resto se usa para el desarrollo y moderación de la plataforma.</p>
            </div>
        </div>

        <p className="flex justify-end"><Link href="/articulo?i=Cabildo_Abierto%3A_Suscripciones">Leer más</Link></p>
    </div>

    return <Desplegable
        text={whySubscriptions}
        btn={<div className=""><span className="underline link3">¿Por qué suscripciones?</span><ExpandMoreIcon/></div>}
        btnOpen={<div className=""><span className="underline link3">¿Por qué suscripciones?</span><ExpandLessIcon/></div>}
    />
}