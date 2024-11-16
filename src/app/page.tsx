import { Metadata } from "next";
import { HomePage } from "../components/home-page";


export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'Un nuevo medio para la discusión pública argentina. Abrimos la información a discusión.'
}


export default function Page({searchParams}: {searchParams: {code?: string, error_description?: string}}) {
    return <HomePage searchParams={searchParams}/>
}