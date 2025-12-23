"use client"

import Link from "next/link";
import {useState} from "react";
import {CheckIcon} from "@phosphor-icons/react";
import {ErrorProvider} from "@/components/layout/contexts/error-context";
import {useRouter} from "next/navigation";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {StateButton} from "@/components/utils/base/state-button"
import {AcceptButtonPanel} from "@/components/utils/dialogs/accept-button-panel";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {PageFrame} from "@/components/utils/page-frame";
import {Paragraph} from "@/components/utils/base/paragraph";
import {UploadFileButton} from "@/components/utils/upload-file-button";
import {post} from "@/components/utils/react/fetch";
import {file2base64, FilePayload} from "@/components/utils/react/files";


type JobApplication = {
    name: string
    email: string
    comment: string
    CV: FilePayload | null
    job: string
}


export default function Page() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("")
    const [comment, setComment] = useState("")
    const [CV, setCV] = useState<FilePayload>(null);
    const [sent, setSent] = useState(false)
    const router = useRouter()

    async function onSend() {
        const {error} = await post<JobApplication, {}>("/job-application", {
            name,
            email,
            comment,
            CV,
            job: "especialista en comunicación"
        })
        if (error) return {error}
        setSent(true)
        return {}
    }

    return <ErrorProvider>
        <PageFrame>
            <div>
                <div className={"text-[var(--text-light)] font-light"}>
                    Búsqueda
                </div>
                <h1 className={"normal-case"}>
                    Especialista en comunicación
                </h1>
            </div>
            <div className={"font-light space-y-4"}>
                <Paragraph>
                    Si te especializás en comunicación (o similares), compartís el patriotismo y creés, como
                    nosotros, que la discusión en redes es un desastre, esto es para vos.
                </Paragraph>
                <Paragraph>
                    Cabildo Abierto es una nueva plataforma de discusión
                    argentina que tiene como objetivo
                    ofrecer herramientas para reunir colectivamente información, eliminar filtros artificiales y
                    facilitar discusiones genuinas.
                </Paragraph>
                <Paragraph>
                    <Link href={"/presentacion"}
                          className={"text-[var(--text-light)] underline hover:text-[var(--text)]"}>
                        Acá
                    </Link> podés ver una presentación de la plataforma.
                </Paragraph>
                <Paragraph>
                    Buscamos alguien que pueda liderar la estrategia de comunicación y difusión de la plataforma y
                    trabajar en conjunto
                    con el resto del <Link href={"/equipo"}>equipo</Link> en el diseño del producto, analizando las necesidades de
                    los usuarios.
                </Paragraph>
                <Paragraph>
                    El trabajo es voluntario hasta que tengamos suficientes donaciones para pagar salarios. No hay un mínimo de horas semanales y el horario es flexible. Estamos en CABA, pero podés sumarte remotamente.
                </Paragraph>
                <Paragraph>
                    Si te interesa sumarte, dejanos tu contacto y te escribimos.
                </Paragraph>
                <div className={"flex flex-col space-y-3"}>
                    <BaseTextField
                        placeholder={"Nombre"}
                        size={"large"}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                        }}
                    />
                    <BaseTextField
                        placeholder={"Correo"}
                        size={"large"}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                    />
                    <BaseTextArea
                        placeholder={"Comentario"}
                        size={"large"}
                        rows={4}
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value)
                        }}
                    />
                    <UploadFileButton
                        onUpload={async f => {
                            const file = await file2base64(f[0])
                            setCV(file)
                        }}
                    >
                        CV
                    </UploadFileButton>
                    {CV && <div className={"panel rounded px-3 py-2 flex space-x-2 items-center"}>
                        <CheckIcon weight={"bold"}/>
                        <div>
                            CV cargado ({CV.fileName})
                        </div>
                    </div>}
                    <div className={"flex justify-between items-center"}>
                        <div>
                            Todos los campos son opcionales.
                        </div>
                        <StateButton
                            variant={"outlined"}
                            handleClick={onSend}
                        >
                            Enviar
                        </StateButton>
                    </div>
                    <div>
                        ¡Gracias!
                    </div>
                </div>
            </div>
        </PageFrame>
        {sent && <AcceptButtonPanel
            onClose={() => {
                setSent(false);
                router.push("/presentacion")
            }}
            open={true}
        >
            <div
                className={"max-w-[400px] font-light text-center text-[var(--text-light)] flex flex-col items-center space-y-4"}>
                <div className={"bg-[var(--background-dark)] rounded-full p-3"}>
                    <CheckIcon fontSize={32}/>
                </div>
                <div className={"font-medium text-[var(--text)] text-lg"}>
                    ¡Recibido!
                </div>
                <div className={"text-sm"}>
                    Gracias por el interés. Te vamos a escribir pronto. Mientras tanto, si no lo hiciste todavía podés
                    solicitar acceso al período de prueba desde la pantalla de inicio de sesión.
                </div>
            </div>
        </AcceptButtonPanel>}
    </ErrorProvider>
}