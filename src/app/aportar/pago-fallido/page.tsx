import { Metadata } from "next";
import { CustomLink as Link } from '../../../components/ui-utils/custom-link';
import {BasicButton} from "../../../components/ui-utils/basic-button";

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    return <div className="text-center">
        <h3 className="py-16">Falló el pago</h3>
        <Link href="/aportar"><BasicButton>Volver a intentar</BasicButton></Link>
    </div>
}