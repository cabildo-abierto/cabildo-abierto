import { Metadata } from "next"
import { CustomLink as Link } from './../../../components/custom-link'

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    const center = <div className="text-center flex flex-col items-center">
        <h3 className="mt-16 mb-8">Esto no debería suceder</h3>
        <div className="max-w-[400px] link text-justify">
            <p>Si pagaste y no se activó tu suscripción <Link href="/soporte">chateá con el equipo de Cabildo Abierto</Link> o mandanos un mail a <Link href="mailto:contacto@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</Link></p>
            <p className="mt-4">
                Si no pagaste nada o se asignó tu suscripción correctamente podés ignorar esto.
            </p>
        </div>
    </div>

    return center
}