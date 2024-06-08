import Markdown from 'react-markdown'
import * as fs from "node:fs";
import parse from "html-react-parser";
import Link from "next/link";
import fsPromises from 'fs/promises';

import path from 'path'

export default async function About(){
    const text = `Allá por mayo de 1810 se encontraban en el Cabildo de Buenos Aires algunos centenares de vecinos para votar la deposición del virrey Cisneros y la creación de una Junta Provisional Gubernativa que daría comienzo al proceso de independencia argentino.

    Hoy, 214 años después, una tecnología llamada Internet posibilita la comunicación inmediata entre mucho más que centenares de personas, ignorando distancias.

    Esta plataforma, que llamamos Cabildo Abierto en honor a aquellas antiguas reuniones democráticas, tiene por objetivo ofrecer los mecanismos necesarios para dar lugar a discusiones en las que toda voz sea escuchada.`
    
    return <div className="h-screen">
        <h1 className="text-2xl font-bold py-8 px-2">Sobre Cabildo Abierto</h1>
        <pre className="px-2 whitespace-pre-line">{text}</pre>
        <h2 className="text-2xl font-bold py-8 px-2">Principios</h2>
        <ul className="px-2">
            <li className="py-2">
                <b>El alcance de las voces es representativo:</b> Toda opinión tiene que ser comentada por un conjunto representativo de personas, y no únicamente por quienes piensan parecido.
            </li>
            <li className="py-2">
                <b>Cuanta más discusión, mejor:</b> Creemos que discutir las cosas nos acerca a mejores respuestas.
                Tiene que haber espacio para discutir cualquier cosa, incluido el funcionamiento de esta plataforma.
            </li>
            <li className="py-2">
                <b>Los usuarios de esta plataforma son sus únicos clientes:</b> La información que aparece en tu pantalla puede ser o bien
                representativa de la plataforma, o bien algo que vos estás buscando. Nunca va a ser la información que alguien pagó para que veas,
                ni va a ser información personalizada en función de tu actividad según un criterio al que no tenés acceso.
            </li>
        </ul>
        <h2 className="text-2xl font-bold py-8 px-2">Sí, hay que pagar</h2>
            La única forma de que una plataforma con estas características exista es si es financiada por sus propios usuarios.
            Pagar por el servicio que ofrecemos te da poder sobre su funcionamiento: si los desarrolladores nos equivocamos, la gente va a dejar de pagar.
            Cuando usás un servicio que no pagás, quedás afuera del circuito económico, perdés injerencia, y te convertís en producto en vez de usuario.

        <h2 className="text-l font-bold py-2 px-2">¿Cómo puede ser democrático si es pago?</h2>
            Si bien el servicio tiene un valor por usuario, es esencial que todos puedan participar.
            El precio de la suscripción mensual va a ser bajo, intentando que no
            represente un valor grande en la billetera de nadie. Sin embargo, esperamos que la participación
            de quienes no puedan pagar sea financiada por quienes encuentren un valor en eso.
            <b> En todo momento en la plataforma va a ver un pozo de suscripciones mensuales al que cualquiera
            puede aportar con donaciones y del que quien lo necesite puede tomar suscripciones.</b>
    </div>
}