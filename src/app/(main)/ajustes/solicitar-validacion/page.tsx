"use client"
import {ReactNode, useRef, useState} from "react";
import {BaseButton} from "@/components/layout/base/baseButton";
import {post} from "@/utils/fetch";
import {produce} from "immer";
import {file2base64, FilePayload} from "@/utils/files";
import {
    CaretDownIcon,
    CaretUpIcon,
    CheckIcon,
    CloudArrowUpIcon,
    ConfettiIcon,
    FileIcon,
    HourglassIcon,
    TrashIcon
} from "@phosphor-icons/react";
import StateButton from "../../../../components/layout/utils/state-button";
import {AcceptButtonPanel} from "@/components/layout/dialogs/accept-button-panel";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import LoadingSpinner from "../../../../components/layout/base/loading-spinner";
import {useQueryClient} from "@tanstack/react-query";
import {BaseTextField} from "@/components/layout/base/base-text-field";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import BaseSelect from "@/components/layout/base/base-select";
import {BaseTextArea} from "@/components/layout/base/base-text-area";


const FormItemWithNote = ({note, ...props}: Omit<FormItemProps, "contentBelow"> & { note?: string }) => {
    const contentBelow = note ? <div className={"text-[var(--text-light)] text-sm"}>
        {note}
    </div> : undefined

    return <FormItem contentBelow={contentBelow} {...props}/>
}


type FormItemProps = {
    label: string,
    contentBelow?: ReactNode,
    children: ReactNode,
    below?: boolean
}

const FormItem = ({label, children, below = false, contentBelow}: FormItemProps) => {

    return <div className={"border-[var(--accent-dark)] p-4 space-y-4"}>
        <div
            className={below ? " space-y-4" : " flex justify-between items-center"}>
            <div className={"sm:text-base text-sm"}>
                {label}
            </div>
            <div>
                {children}
            </div>
        </div>
        {contentBelow}
    </div>
}


const FormItemWithFiles = ({fileNames, onRemove, ...props}: Omit<FormItemProps, "fileNames"> & {
    fileNames: string[],
    onRemove: (_: number) => void
}) => {
    const contentBelow = fileNames && fileNames.length > 0 ? <div
        className={"flex space-y-2 flex-col"}
    >
        {fileNames.map((fileName, i) => {
            return <div
                key={i}
                className={"flex justify-between items-center space-x-2 border border-[var(--accent-dark)] p-2"}
            >
                <div className={"flex items-center space-x-2"}>
                    <FileIcon/>
                    <div>
                        {fileName}
                    </div>
                </div>
                <BaseIconButton
                    onClick={() => {
                        onRemove(i)
                    }}
                    size={"small"}
                >
                    <TrashIcon/>
                </BaseIconButton>
            </div>
        })}
    </div> : undefined

    return <FormItem
        {...props}
        contentBelow={contentBelow}
    />
}


const UploadFileButton = ({children, onUpload, multiple = false}: {
    children: ReactNode,
    onUpload: (_: FileList) => void,
    multiple?: boolean
}) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    return <BaseButton
        onClick={handleButtonClick}
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudArrowUpIcon/>}
    >
        {children}
        <input
            ref={inputRef}
            className={"hidden"}
            type={"file"}
            onChange={(e) => {
                onUpload(e.target.files)
            }}
            multiple={multiple}
        />
    </BaseButton>
}


const ValidacionPersona = ({request, setRequest}: {
    request: LoadingValidationRequest,
    setRequest: (_: LoadingValidationRequest) => void
}) => {
    if (request.tipo != "persona") return

    return <div className={"space-y-6"}>
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
            <UploadFileButton onUpload={async (files) => {
                const file = await file2base64(files[0])
                setRequest(produce(request, draft => {
                    if (draft.tipo == "persona" && files.length > 0) {
                        draft.dniDorso = file
                    }
                }))
            }}>
                <span className={"text-xs w-24"}>Subir archivo</span>
            </UploadFileButton>
        </FormItemWithFiles>
    </div>
}


const ValidacionOrg = ({request, setRequest}: {
    request: LoadingValidationRequest,
    setRequest: (_: LoadingValidationRequest) => void
}) => {

    if (request.tipo != "org") return

    return <div className={"space-y-6"}>
        <div className={"text-[var(--text-light)] px-4 text-sm"}>
            Adjuntá la documentación necesaria para identificar a tu organización y validar que sos su representante.
        </div>
        <FormItem label={"Tipo de organización"}>
            <div className={"w-50"}>
                <BaseSelect
                    optionLabels={o => {
                        if (o == "creador-individual") return "Creador de contenidos"
                        else if (o == "empresa") return "Empresa"
                        else if (o == "medio") return "Medio"
                        else if (o == "fundacion") return "Fundación"
                        else if (o == "consultora") return "Consultora"
                        else if (o == "otro") return "Otro"
                        throw Error("Opción desconocida")
                    }}
                    options={["creador-individual", "empresa", "medio", "fundacion", "consultora", "otro"]}
                    value={request.tipoOrg ?? "creador-individual"}
                    onChange={(e) => {
                        setRequest(produce(request, draft => {
                            draft.tipoOrg = e as OrgType
                        }))
                    }}
                />
            </div>
        </FormItem>
        <FormItemWithNote
            label={"Sitio web"}
            note={"Si el dominio de tu @ y el de tu sitio web coinciden, no hace falta que nos envíes ningún otro dato o documentación."}
        >
            <BaseTextField
                value={request.sitioWeb ?? ""}
                placeholder={"https://ejemplo.com"}
                onChange={(e) => {
                    setRequest(produce(request, draft => {
                        draft.sitioWeb = e.target.value
                    }))
                }}
            />
        </FormItemWithNote>
        <FormItem label={"Mail de contacto"}>
            <BaseTextField
                value={request.email ?? ""}
                placeholder={"contacto@ejemplo.com"}
                onChange={(e) => {
                    setRequest(produce(request, draft => {
                        draft.email = e.target.value
                    }))
                }}
            />
        </FormItem>
        <FormItemWithFiles
            label={"Documentación respaldatoria"}
            fileNames={request.documentacion ? request.documentacion.map(doc => doc.fileName) : []}
            onRemove={(i) => {
                setRequest(produce(request, draft => {
                    draft.documentacion = draft.documentacion.filter((_, j) => i != j)
                }))
            }}
        >
            <UploadFileButton multiple={true} onUpload={async (files) => {
                const filesBase64 = await Promise.all(Array.from(files).map(file2base64))
                setRequest(produce(request, draft => {
                    if (draft.tipo == "org") {
                        if (draft.documentacion != undefined) {
                            draft.documentacion.push(...filesBase64)
                        } else {
                            draft.documentacion = filesBase64
                        }
                    }
                }))
            }}>
                <span className={"w-26 text-xs"}>Subir archivos</span>
            </UploadFileButton>
        </FormItemWithFiles>
        <FormItem label={"Comentarios"} below={true}>
            <BaseTextArea
                rows={2}
                value={request.comentarios ?? ""}
                placeholder={"Otros datos útiles."}
                onChange={(e) => {
                    setRequest(produce(request, draft => {
                        draft.comentarios = e.target.value
                    }))
                }}
            />
        </FormItem>
    </div>
}


const Desplegable = ({children, text}: { children: ReactNode, text: string }) => {
    const [open, setOpen] = useState(false)

    return <div className={"w-full panel-dark portal group"}>
        <button
            onClick={() => {
                setOpen(!open)
            }}
            className={"flex space-x-1 items-center p-4"}
        >
            <span className={"text-base"}>
                {text}
            </span>
            {open ? <CaretUpIcon/> : <CaretDownIcon/>}
        </button>
        {open && <div className={"px-4 pb-4"}>
            {children}
        </div>}
    </div>
}


export type OrgType = "creador-individual" | "empresa" | "medio" | "fundacion" | "consultora" | "otro"


type LoadingValidationRequest = Partial<ValidationRequestProps>


export type ValidationRequestProps = {
    tipo: "persona"
    dniFrente: FilePayload
    dniDorso: FilePayload
} | {
    tipo: "org"
    tipoOrg: OrgType
    sitioWeb: string
    email: string
    documentacion: FilePayload[]
    comentarios: string
}


function validateSubmission(request: LoadingValidationRequest): { success: true, request: ValidationRequestProps } | {
    success: false,
    error: string
} {
    if (request.tipo == "persona") {
        if (request.dniDorso != undefined && request.dniFrente != undefined) {
            return {
                success: true,
                request: {
                    tipo: "persona",
                    dniFrente: request.dniFrente,
                    dniDorso: request.dniDorso
                }
            }
        }
    } else if (request.tipo == "org") {
        if (request.tipoOrg != undefined) {
            return {
                success: true,
                request: {
                    tipo: "org",
                    tipoOrg: request.tipoOrg,
                    sitioWeb: request.sitioWeb,
                    email: request.email,
                    documentacion: request.documentacion,
                    comentarios: request.comentarios
                }
            }
        } else {
            return {
                success: false,
                error: "Elegí un tipo de organización."
            }
        }
    } else {
        return {
            success: false,
            error: "Elegí un tipo de cuenta."
        }
    }
}


const Page = () => {
    const [request, setRequest] = useState<LoadingValidationRequest>({tipo: "persona"})
    const [requestSent, setRequestSent] = useState(false)
    const {data: curRequest, isLoading} = useCurrentValidationRequest()
    const qc = useQueryClient()

    async function onSubmit() {
        const res = validateSubmission(request)
        if (res.success == true) {
            const {error} = await post<ValidationRequestProps, {}>("/validation-request", res.request)
            if (!error) {
                setRequestSent(true)
                qc.setQueryData(["validation-request"], {type: res.request.tipo, result: "Pendiente"})
            }
            return {error}
        } else {
            return {error: res.error}
        }
    }

    async function onCancel() {
        const {error} = await post<{}, {}>("/validation-request/cancel", {})
        if (!error) {
            qc.setQueryData(["validation-request"], {type: null})
        }
        return {error}
    }

    if (isLoading) {
        return <div className={"py-6"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"pt-6 space-y-6 mx-1 font-light"}>
        {curRequest && curRequest.result == "Aceptada" &&
            <div className={"flex flex-col items-center space-y-4 p-8 bg-[var(--background-dark)] rounded-lg"}>
                <div
                    className={"h-16 w-16 rounded-full bg-[var(--background-dark2)] flex items-center justify-center text-green-400"}>
                    <CheckIcon fontSize={24}/>
                </div>
                <div className={"text-lg text-[var(--text-light)] font-semibold"}>
                    Tu cuenta ya está verificada
                </div>
            </div>}
        {curRequest && curRequest.type && curRequest.result == "Pendiente" && <div>
            <div className={"bg-[var(--background-dark)] p-4 w-full space-y-8 flex flex-col items-center"}>
                <div>
                    <HourglassIcon/>
                </div>
                <h2 className={"normal-case"}>
                    Estamos procesando tu solicitud
                </h2>
                <div className={"text-center text-[var(--text-light)]"}>
                    <p>
                        Solicitaste una verificación de
                        cuenta {request.tipo == "persona" ? "personal" : "de organización"}. En un plazo
                        de {request.tipo == "org" ? 72 : 48} horas te va a llegar una notificación con el
                        resultado.
                    </p>
                </div>
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        endIcon={<TrashIcon/>}
                        size={"small"}
                        handleClick={onCancel}
                    >
                        Cancelar solicitud
                    </StateButton>
                </div>
            </div>
        </div>}
        {(!curRequest || !curRequest.type) && <div className={"portal group panel-dark p-4 space-y-6"}>
            <h2 className={"normal-case"}>
                Solicitá la verificación de tu cuenta
            </h2>
            <FormItem label={"Tipo de cuenta"}>
                <div className={"flex justify-end"}>
                    <BaseSelect
                        triggerClassName={"w-[140px]"}
                        value={request.tipo}
                        options={["persona", "org"]}
                        optionLabels={(o) => {
                            if (o == "persona") return "Persona"
                            else return "Organización"
                        }}
                        label={"Tipo de cuenta"}
                        onChange={(value) => {
                            if (value == "org" || value == "persona") {
                                setRequest({tipo: value, tipoOrg: value == "org" ? "creador-individual" : undefined})
                            }
                        }}
                    />
                </div>
            </FormItem>
            {request.tipo == "persona" && <ValidacionPersona request={request} setRequest={setRequest}/>}
            {request.tipo == "org" && <ValidacionOrg request={request} setRequest={setRequest}/>}
            <div className={"flex justify-end"}>
                <StateButton
                    handleClick={onSubmit}
                    variant={"outlined"}
                >
                    Enviar
                </StateButton>
            </div>
        </div>}

        <div className={"space-y-4 pb-16 font-light"}>
            <Desplegable text={"¿Cómo funciona la verificación de personas?"}>
                <div className={"text-[var(--text-light)] py-2 space-y-2"}>
                    <p>
                        El objetivo de la verificación es asegurar que la cuenta se corresponde con una persona real y
                        que
                        cada persona real tiene una única cuenta personal.
                        Si querés tener una segunda cuenta, puede ser una cuenta de organización.
                    </p>
                    <p>
                        El proceso de verificación es el siguiente:
                    </p>
                    <ol>
                        <li>
                            Solicitás la verificación enviándonos una foto de tu DNI.
                        </li>
                        <li>
                            Revisamos la foto y si está todo bien nos guardamos un código representativo de tu número de
                            DNI.
                            Si no coincide con ningún otro código de nuestra base de datos, tu cuenta está validada.
                        </li>
                        <li>
                            En un plazo de 48 horas te va a llegar una notificación con el resultado.
                        </li>
                        <li>
                            Borramos la foto de tu dni de nuestra base de datos.
                        </li>
                    </ol>
                </div>
            </Desplegable>
            <Desplegable text={"¿Cómo funciona la verificación de organizaciones?"}>
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
            </Desplegable>
        </div>
        <AcceptButtonPanel
            onClose={() => {
                setRequestSent(false)
            }}
            open={requestSent}
        >
            <div className={"flex flex-col items-center space-y-4 pb-6"}>
                <div className={"text-[var(--text-light)] text-lg"}>
                    <ConfettiIcon fontSize={"22px"}/>
                </div>
                <h2 className={"normal-case"}>
                    Solicitud enviada
                </h2>
                <div className={"w-full"}>
                    En un plazo de {request.tipo == "org" ? 72 : 48} horas te va a llegar una notificación con el
                    resultado.
                </div>
            </div>
        </AcceptButtonPanel>
    </div>
}


export default Page