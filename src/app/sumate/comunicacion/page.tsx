"use client"

import Link from "next/link";
import {TextField} from "../../../../modules/ui-utils/src/text-field";
import {Logo} from "../../../../modules/ui-utils/src/logo";
import {UploadFileButton} from "../../../../modules/ui-utils/src/upload-file-button";
import {useState} from "react";
import {file2base64, FilePayload} from "@/utils/files";
import {CheckIcon} from "@phosphor-icons/react";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {ErrorProvider} from "@/components/layout/error-context";
import {post} from "@/utils/fetch";
import {AcceptButtonPanel} from "../../../../modules/ui-utils/src/accept-button-panel";
import {useRouter} from "next/navigation";


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
        const {error} =  await post<JobApplication, {}>("/job-application", {
            name,
            email,
            comment,
            CV,
            job: "especialista en comunicación"
        })
        if(error) return {error}
        setSent(true)
    }

    return <ErrorProvider>
        <div className={"flex flex-col items-center pt-16"}>
            <div className={"max-w-[600px] space-y-4"}>
                <h1 className={"normal-case"}>
                    Especialista en comunicación, nosotros buscar
                </h1>
                <div className={"font-light space-y-4"}>
                    <p>
                        Si te especializás en comunicación (o similares), compartís el patriotismo y creés, como
                        nosotros, que la discusión en redes es un desastre, esto es para vos.
                    </p>
                    <p>
                        Cabildo Abierto es una nueva plataforma de discusión
                        argentina que tiene como objetivo
                        ofrecer herramientas para reunir colectivamente información, eliminar filtros artificiales y
                        facilitar discusiones genuinas.
                    </p>
                    <p>
                        <Link href={"/presentacion"}
                              className={"text-[var(--text-light)] underline hover:text-[var(--text)]"}>
                            Acá
                        </Link> podés ver una presentación de la plataforma.
                    </p>
                    <p>
                        Es un proyecto incipiente. En este momento somos tres personas (dos desarrolladores y una
                        diseñadora
                        gráfica). Estamos buscando la cuarta.
                    </p>
                    <p>
                        Buscamos alguien que pueda liderar la estrategia de comunicación y difusión de la plataforma y trabajar en conjunto
                        con el resto del equipo en el diseño del producto, analizando las necesidades de
                        los usuarios.
                    </p>
                    <p>
                        El trabajo por ahora es ad-honorem (para todos) porque no tenemos
                        financiamiento. No hay un mínimo de horas semanales y tenemos flexibilidad.
                    </p>
                    <p>
                        Si te interesa sumarte, dejanos tu contacto y te escribimos.
                    </p>
                    <div className={"flex flex-col space-y-3"}>
                        <TextField
                            fontSize={"15px"}
                            label={"Nombre"}
                            size={"small"}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                            }}
                        />
                        <TextField
                            fontSize={"15px"}
                            label={"Correo"}
                            size={"small"}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                            }}
                        />
                        <TextField
                            fontSize={"15px"}
                            label={"Comentario"}
                            size={"small"}
                            minRows={4}
                            multiline={true}
                            paddingX={"12px"}
                            value={comment}
                            onChange={(e) => {
                                setComment(e.target.value)
                            }}
                        />
                        <UploadFileButton onUpload={async f => {
                            const file = await file2base64(f[0])
                            setCV(file)
                        }}>
                            CV
                        </UploadFileButton>
                        {CV && <div className={"panel rounded px-3 py-2 flex space-x-2 items-center"}>
                            <CheckIcon weight={"bold"}/>
                            <div>
                                CV cargado ({CV.fileName})
                            </div>
                        </div>}
                        <div className={"flex justify-between items-center"}>
                            <div className={""}>
                                Todos los campos son opcionales.
                            </div>
                            <StateButton
                                text1={"Enviar"}
                                variant={"outlined"}
                                handleClick={onSend}
                            />
                        </div>
                        <div>
                            ¡Gracias!
                        </div>
                    </div>
                </div>
                <div className={"flex w-full justify-center py-8"}>
                    <Logo width={32} height={32}/>
                </div>
            </div>
        </div>
        {sent && <AcceptButtonPanel onClose={() => {setSent(false); router.push("/presentacion")}} open={true}>
            <div className={"max-w-[400px] font-light text-center text-[var(--text-light)] flex flex-col items-center space-y-4"}>
                <div className={"bg-[var(--background-dark)] rounded-full p-3"}>
                    <CheckIcon fontSize={32}/>
                </div>
                <div className={"font-medium text-[var(--text)]"}>
                    ¡Recibido!
                </div>
                <div className={"text-sm"}>
                    Gracias por el interés. Te vamos a escribir pronto. Mientras tanto, si no lo hiciste todavía podés solicitar acceso al período de prueba.
                </div>
            </div>
        </AcceptButtonPanel>}
    </ErrorProvider>
}