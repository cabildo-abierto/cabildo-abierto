"use client"
import {CustomLink as Link} from '../../../../modules/ui-utils/src/custom-link';

import {Button} from "../../../../modules/ui-utils/src/button";
import {PageCardMessage} from "@/components/aportar/page-card-message";



export default function Page(){
    return <PageCardMessage
        title={"¡Muchísimas gracias por tu aporte!"}
        content={<div className={"space-y-4"}>
            <div className="text-lg">
                El pago se registró correctamente.
            </div>
            <div>
                <Link href="/inicio">
                    <Button>
                        Ir al inicio
                    </Button>
                </Link>
            </div>
        </div>}
    />
}