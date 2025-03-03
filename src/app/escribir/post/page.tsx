import { Metadata } from "next"
import {NotFoundPage} from "../../../components/ui-utils/not-found-page";


export const metadata: Metadata = {
    title: 'Escribir publicación rápida',
    description: 'Escribir una publicación rápida en Cabildo Abierto.'
}


const PublicacionRapida: React.FC = () => {
    return <NotFoundPage/>
}

export default PublicacionRapida