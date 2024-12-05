import { Metadata } from "next";
import { CustomLink as Link } from './../../../components/custom-link';

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    return <div className="text-center">
        <h3 className="py-16">Falló el pago</h3>
        <Link href="/aportar" className="gray-btn">Volver a intentar</Link>
    </div>
}