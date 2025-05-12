import {PageCardMessage} from "@/components/aportar/page-card-message";
import {profileUrl, topicUrl} from "@/utils/uri";
import Link from "next/link"


const Page = () => {
    const content = (
        <div className={""}>
            <ul className={"ml-6 mt-6"}>
                <li>Escribirnos por mensaje privado de Bluesky a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link>.</li>
                <li>
                    Mencionar a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link> en un post.
                </li>
                <li>
                    Escribirnos por mail a <Link
                    href={"mailto:soporte@cabildoabierto.ar"}>soporte@cabildoabierto.ar</Link>.
                </li>
                <li>
                    Comentar los <Link
                    href={topicUrl("Cabildo Abierto")}
                >
                    temas de Cabildo Abierto
                </Link>.
                </li>
            </ul>
        </div>
    )

    return <PageCardMessage
        title={"Por cualquier consulta, problema o sugerencia podés"}
        content={content}
    />
}

export default Page