import { topicUrl } from "@/utils/uri"
import Link from "next/link"



export const TopicFeedInfo = () => {
    return <div>
        <div>
            <b>Menciones.</b> Las publicaciones, respuestas, artículos y otros temas que hablaron del tema. <Link
            target="_blank"
            className="text-[var(--text-light)] hover:underline"
            href={topicUrl("Cabildo Abierto: Menciones a temas")}
        >
            ¿Cómo detectamos las menciones?
        </Link>
        </div>
        <div>
            <b>Discusión.</b> Una sección de comentarios hechos directamente sobre el tema. Se puede usar para agregar
            opiniones.
        </div>
        <div>
            <b>Otros temas.</b> Temas cuyo contenido menciona a este tema.
        </div>
    </div>
}