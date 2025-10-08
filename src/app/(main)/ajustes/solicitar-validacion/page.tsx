"use client"
import {styled, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {ReactNode, useState} from "react";
import {Button} from "../../../../../modules/ui-utils/src/button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {post} from "@/utils/fetch";
import {produce} from "immer";
import {file2base64, FilePayload} from "@/utils/files";
import {ConfettiIcon, FileIcon, TrashIcon} from "@phosphor-icons/react";
import StateButton from "../../../../../modules/ui-utils/src/state-button";
import {AcceptButtonPanel} from "../../../../../modules/ui-utils/src/accept-button-panel";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {useQueryClient} from "@tanstack/react-query";
import CheckIcon from "@mui/icons-material/Check";
import {TextField} from "../../../../../modules/ui-utils/src/text-field";
import {IconButton} from "../../../../../modules/ui-utils/src/icon-button";
import {Select} from "../../../../../modules/ui-utils/src/select";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


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

    return <div className={"bg-[var(--background-dark2)] p-4 space-y-4"}>
        <div
            className={below ? " space-y-4" : " flex justify-between items-center"}>
            <div className={"sm:text-base text-sm"}>
                {label}
            </div>
            {children}
        </div>
        {contentBelow}
    </div>
}


const FormItemWithFiles = ({fileNames, onRemove, ...props}: Omit<FormItemProps, "fileNames"> & {
    fileNames: string[],
    onRemove: (_: number) => void
}) => {
    const contentBelow = fileNames && fileNames.length > 0 ? <div className={"flex space-y-2 flex-col"}>
        {fileNames.map((fileName, i) => {
            return <div
                key={i}
                className={"flex justify-between items-center space-x-2 bg-[var(--background-dark3)] p-2"}
            >
                <div className={"flex items-center space-x-2"}>
                    <FileIcon/>
                    <div>
                        {fileName}
                    </div>
                </div>
                <IconButton
                    onClick={() => {
                        onRemove(i)
                    }}
                    size={"small"}
                    color={"background-dark3"}
                >
                    <TrashIcon/>
                </IconButton>
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
    return <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudUploadIcon/>}
        color={"background-dark2"}
    >
        {children}
        <VisuallyHiddenInput
            type="file"
            onChange={(e) => {
                onUpload(e.target.files)
            }}
            multiple={multiple}
        />
    </Button>
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
        <div className={"text-[var(--text-light)] px-2 text-sm"}>
            Adjuntá la documentación necesaria para identificar a tu organización y validar que sos su representante.
        </div>
        <FormItem label={"Tipo de organización"}>
            <div className={"w-48"}>
                <Select
                    fontSize={"13px"}
                    backgroundColor={"background-dark2"}
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
            <TextField
                size={"small"}
                fontSize={"13px"}
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
            <TextField
                size={"small"}
                fontSize={"13px"}
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
            <TextField
                size={"small"}
                fullWidth={true}
                minRows={2}
                paddingX={"12px"}
                multiline={true}
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

    return <div className={"w-full bg-[var(--background-dark)] p-4"}>
        <button
            onClick={() => {
                setOpen(!open)
            }}
            className={"flex space-x-1 items-center"}
        >
            <span className={"text-base"}>
                {text}
            </span>
            {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
        </button>
        {open && children}
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
                    <CheckIcon fontSize={"large"}/>
                </div>
                <div className={"text-lg text-[var(--text-light)] font-semibold"}>
                    Tu cuenta ya está verificada
                </div>
            </div>}
        {curRequest && curRequest.type && curRequest.result == "Pendiente" && <div>
            <div className={"bg-[var(--background-dark)] p-4 w-full space-y-8 flex flex-col items-center"}>
                <div>
                    <HourglassEmptyIcon/>
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
                        text1="Cancelar solicitud"
                        color={"background-dark2"}
                        size={"small"}
                        handleClick={onCancel}
                    />
                </div>
            </div>
        </div>}
        {(!curRequest || !curRequest.type) && <div className={"rounded-panel-dark p-4 space-y-6"}>
            <h2 className={"normal-case"}>
                Solicitá la verificación de tu cuenta
            </h2>
            <FormItem label={"Tipo de cuenta"}>
                <ToggleButtonGroup
                    color="primary"
                    value={request.tipo}
                    exclusive
                    onChange={(e, value) => {
                        setRequest({tipo: value, tipoOrg: value == "org" ? "creador-individual" : undefined})
                    }}
                    size={"small"}
                    aria-label="Tipo de cuenta"
                >
                    <ToggleButton sx={{borderRadius: 0, textTransform: "none"}} value="persona">Persona</ToggleButton>
                    <ToggleButton sx={{borderRadius: 0, textTransform: "none"}} value="org">Organización</ToggleButton>
                </ToggleButtonGroup>
            </FormItem>
            {request.tipo == "persona" && <ValidacionPersona request={request} setRequest={setRequest}/>}
            {request.tipo == "org" && <ValidacionOrg request={request} setRequest={setRequest}/>}
            <div className={"flex justify-end"}>
                <StateButton
                    handleClick={onSubmit}
                    text1={"Enviar"}
                    variant={"outlined"}
                    color={"background-dark"}
                />
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