import { Metadata } from "next";
import { HomePage } from "../components/home-page";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'El lugar donde el país se reúne a discutir. Entrá a conectar con otros y construir conocimiento colectivo.'
}

export default function Page({searchParams}: {searchParams: {code?: string, error_description?: string}}) {
    return <HomePage searchParams={searchParams}/>
}