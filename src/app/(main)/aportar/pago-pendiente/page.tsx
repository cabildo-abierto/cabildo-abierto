import {Metadata} from "next"
import {PageCardMessage} from "@/components/aportar/page-card-message";
import Link from "next/link";
import {Button} from "../../../../../modules/ui-utils/src/button";

export const metadata: Metadata = {
    title: 'Error en el pago'
}

export default function Page(){
    return <PageCardMessage
        className={"pb-6 pt-8 px-12"}
        title={"Aporte pendiente"}
        content={<div className={"space-y-6 flex flex-col items-center"}>
            <div className={"font-light text-center"}>
                El pago quedó como pendiente. Si podés, revisá cómo te figura en tu medio de pago. Ante cualquier duda, escribinos.
            </div>
            <div>
                <Link href="/aportar">
                    <Button size="small" variant={"outlined"} color={"background-dark2"}>Volver a intentar</Button>
                </Link>
            </div>
        </div>}
    />
}