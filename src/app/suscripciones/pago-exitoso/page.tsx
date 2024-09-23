import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Pago exitoso'
}

export default function Page(){
    return <div className="text-center">
        <h3 className="py-16">¡Gracias por tu compra!</h3>
        <div className="text-gray-600">
            Tu pago se registró exitosamente. Podés empezar a navegar...
        </div>
        <Link href="/suscripciones" className="gray-btn">Ir al inicio</Link>
    </div>
}