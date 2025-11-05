"use client"
import {useState} from "react";
import {produce} from "immer";
import {file2base64} from "@/utils/files";
import {UploadFileButton} from "@/components/layout/utils/upload-file-button";
import {FormItemWithFiles} from "@/components/ajustes/verificar/form-item";
import {DNIValidationRequestProps} from "@/components/ajustes/verificar/types";
import {SendButton} from "@/components/ajustes/verificar/send-button";
import {IdentificationCardIcon} from "@phosphor-icons/react";
import {Desplegable} from "@/components/layout/utils/desplegable";
import Link from "next/link";
import {Note} from "@/components/layout/utils/note";


export default function Page() {
    const [request, setRequest] = useState<Partial<DNIValidationRequestProps>>({})

    return <>
        <div className={"px-4 pt-2 flex justify-center"}>
            <IdentificationCardIcon
                fontSize={48}
                color={"var(--text-light)"}
                weight={"light"}
            />
        </div>
        <FormItemWithFiles
            label={"Foto del frente de tu DNI"}
            fileNames={request.dniFrente ? [request.dniFrente.fileName] : []}
            onRemove={() => {
                setRequest(produce(request, draft => {
                    draft.dniFrente = undefined
                }))
            }}
        >
            <UploadFileButton
                onUpload={async (files: FileList) => {
                    const file = await file2base64(files[0])
                    setRequest(produce(request, draft => {
                        if (draft.tipo == "persona" && files.length > 0) {
                            draft.dniFrente = file
                        }
                    }))
                }}
            >
                <span className={"text-xs w-24"}>Subir archivo</span>
            </UploadFileButton>
        </FormItemWithFiles>

        <FormItemWithFiles
            label={"Foto del dorso de tu DNI"}
            fileNames={request.dniDorso ? [request.dniDorso.fileName] : []}
            onRemove={() => {
                setRequest(produce(request, draft => {
                    draft.dniDorso = undefined
                }))
            }}
        >
            <UploadFileButton
                onUpload={async (files) => {
                    const file = await file2base64(files[0])
                    console.log("got file")
                    setRequest(produce(request, draft => {
                        if (draft.tipo == "persona" && files.length > 0) {
                            draft.dniDorso = file
                        }
                    }))
                }}>
                <span className={"text-xs w-24"}>Subir archivo</span>
            </UploadFileButton>
        </FormItemWithFiles>

        <div className={"flex justify-end"}>
            <SendButton request={request}/>
        </div>

        <Desplegable
            className="text-sm"
            text={"¿Cómo funciona la verificación con DNI?"}
        >
            <div className={"text-[var(--text-light)] space-y-2"}>
                <p>
                    El objetivo es verificar que la cuenta se corresponde con una persona real y que es su única cuenta.
                    El proceso de verificación es manual y funciona así:
                </p>
                <ol>
                    <li>
                        Solicitás la verificación enviando una foto de tu DNI.
                    </li>
                    <li>
                        Leemos el número de DNI de la foto y lo transformamos en un código único e <Link
                        href={"https://en.wikipedia.org/wiki/SHA-2"}>irreversible</Link>. Por ejemplo: 41.534.323 se
                        transforma en <span
                        className={"font-mono break-all"}>79e4faa73cf68a464982e90e02c94b30bdc58fcf0a09e72d420736b0e5389e20</span>.
                    </li>
                    <li>
                        Si el código no coincide con el código de ningún otro DNI en nuestra base de datos, se acepta la
                        solicitud y se almacena el código de tu DNI (pero no tu número de DNI).
                    </li>
                    <li>
                        Se borra la foto de tu dni de nuestra base de datos.
                    </li>
                </ol>
            </div>
        </Desplegable>


        <Desplegable
            className="text-sm"
            text={"¿Se preserva el anonimato después de la verificación con DNI?"}
        >
            <div className={"text-[var(--text-light)] space-y-2"}>
                <p>
                    Sí. La verificación es independiente y no implica mostrar públicamente tu identidad en tu perfil.
                </p>
                <ol>
                    <li>
                        Solicitás la verificación enviando una foto de tu DNI.
                    </li>
                    <li>
                        Leemos el número de DNI de la foto y lo transformamos en un código único e <Link
                        href={"https://en.wikipedia.org/wiki/SHA-2"}>irreversible</Link>. Por ejemplo: 41.534.323 se
                        transforma en <span
                        className={"font-mono break-all"}>79e4faa73cf68a464982e90e02c94b30bdc58fcf0a09e72d420736b0e5389e20</span>.
                    </li>
                    <li>
                        Si el código no coincide con el código de ningún otro DNI en nuestra base de datos, se acepta la
                        solicitud y se almacena el código de tu DNI (pero no tu número de DNI).
                    </li>
                    <li>
                        Se borra la foto de tu dni de nuestra base de datos.
                    </li>
                </ol>
            </div>
        </Desplegable>
        <Note className={"text-left"}>
            También podés <Link href={"/verificacion/verificar/persona/mp"}>verificar tu cuenta usando Mercado
            Pago.</Link>
        </Note>
        {/*<Desplegable text={"¿Cómo funciona la verificación de organizaciones?"}>
            <div className={"text-[var(--text-light)]"}>
                <ol>
                    <li>
                        Solicitás la verificación enviándonos los datos que creas suficientes, dependiendo del tipo
                        de
                        organización.
                    </li>
                    <li>
                        Revisamos la documentación y que no haya ninguna cuenta de organización similar.
                    </li>
                    <li>
                        En un plazo de 72 horas te va a llegar una notificación con el resultado.
                    </li>
                    <li>
                        Borramos los datos de tu solicitud de nuestra base de datos.
                    </li>
                </ol>
            </div>
        </Desplegable>*/}
    </>
}