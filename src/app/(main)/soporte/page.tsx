import {PageCardMessage} from "@/components/aportar/page-card-message";
import {profileUrl, topicUrl} from "@/utils/uri";
import Link from "next/link"


const Page = () => {
    const content = (
        <div className={""}>
            <ul className={"ml-6 mt-6"}>
                <li>escribirnos por mensaje privado de Bluesky a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link>,</li>
                <li>
                    mencionar a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link> en un post,
                </li>
                <li>
                    escribirnos por mail a <Link
                    href={"mailto:soporte@cabildoabierto.ar"}>soporte@cabildoabierto.ar</Link>, o
                </li>
                <li>
                    comentar los <Link
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