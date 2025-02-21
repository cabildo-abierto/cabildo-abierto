import { Metadata } from "next";
import { CustomLink as Link } from '../../../components/custom-link';
import {BasicButton} from "../../../components/ui-utils/basic-button";

export const metadata: Metadata = {
    title: 'Pago exitoso'
}

export default function Page(){
    const center = <div className="text-center">
        <h3 className="py-16">¡Gracias por tu compra!</h3>
        <div className="text-lg">
            Tu pago se registró correctamente.
        </div>
        <div className="text-[var(--text-light)] text-sm py-16">Ante cualquier duda o inconveniente con tu pago podés escribirnos por la <Link href="/soporte" className="link2">pestaña de soporte</Link> o por mail a <Link href="mailto:soporte@cabildoabierto.com.ar" className="link3">soporte@cabildoabierto.com.ar</Link>
        </div>
        <Link href="/inicio"><BasicButton>Ir al inicio</BasicButton></Link>
    </div>

    return center
}