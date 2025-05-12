"use client"
import Link from 'next/link';

import {Button} from "../../../../../modules/ui-utils/src/button";
import {PageCardMessage} from "@/components/aportar/page-card-message";


export default function Page(){
    return <PageCardMessage
        title={"Ocurrió un error al procesar tu aporte"}
        content={<Link href="/aportar"><Button>Volver a intentar</Button></Link>}
    />
}