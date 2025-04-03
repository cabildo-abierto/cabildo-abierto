import { Metadata } from "next";
import { CustomLink as Link } from '../../../../modules/ui-utils/src/custom-link';

import {Button} from "../../../../modules/ui-utils/src/button";

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    return <div className="text-center">
        <h3 className="py-16">Falló el pago</h3>
        <Link href="/aportar"><Button>Volver a intentar</Button></Link>
    </div>
}