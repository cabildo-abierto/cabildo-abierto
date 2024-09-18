import Link from "next/link";


export default function Page(){
    return <div className="text-center">
        <h3 className="py-16">Falló el pago</h3>
        <Link href="/suscripciones" className="gray-btn">Volver a intentar</Link>
    </div>
}