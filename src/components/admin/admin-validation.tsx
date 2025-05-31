import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {usePendingValidationRequests} from "@/queries/api";
import {OrgType} from "@/app/(main)/ajustes/solicitar-validacion/page";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {ContentTopRowAuthor} from "@/components/feed/frame/content-top-row-author";
import {formatIsoDate} from "@/utils/dates";
import {DateSince} from "../../../modules/ui-utils/src/date";
import {useState} from "react";
import {ProfilePic} from "@/components/profile/profile-pic";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {MenuItem, Select, Switch, TextField} from "@mui/material";
import {Button} from "../../../modules/ui-utils/src/button";
import {FilePayload} from "@/utils/files";
import {DownloadIcon} from "@phosphor-icons/react";
import Image from "next/image"
import {produce} from "immer";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {post} from "@/utils/fetch";

export type ValidationRequestView = { id: string, user: ProfileViewBasic, createdAt: Date } & ({
    tipo: "persona"
    dniFrente: FilePayload
    dniDorso: FilePayload
} | {
    tipo: "org"
    tipoOrg: OrgType
    sitioWeb?: string
    email?: string
    documentacion: FilePayload[]
    comentarios?: string
})

function DownloadButton({file}: { file: FilePayload }) {

    const downloadFile = () => {
        const base64Data = file.base64.split(',')[1] || file.base64;

        const byteCharacters = atob(base64Data);
        const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], {type: 'application/octet-stream'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Liberar memoria
        URL.revokeObjectURL(url);
    };

    if (file.base64 == "not found") return <div className={"bg-[var(--background-dark)] p-1"}>
        Error al cargar el archivo
    </div>

    return (
        <Button
            size={"small"}
            onClick={downloadFile}
            endIcon={<DownloadIcon/>}
        >
            {file.fileName}
        </Button>
    );
}


const FileViewer = ({file}: { file: FilePayload }) => {
    const isImage = [".jpg", ".jpeg", ".png", ".gif"].some(ext =>
        file.fileName.toLowerCase().endsWith(ext)
    );

    if (isImage) {
        return (
            <div className="">
                <Image
                    src={file.base64}
                    alt={file.fileName}
                    width={600}
                    height={600}
                    className={"rounded-lg"}
                />
            </div>
        );
    }

    return <DownloadButton file={file}/>;
};


type ValidationRequestResultProps = {
    id: string
    result: "accept" | "reject"
    reason: string
    dni?: number
}


const ValidationRequest = ({request}: { request: ValidationRequestView }) => {
    const [open, setOpen] = useState(false)
    const [result, setResult] = useState<"accept" | "reject">("accept")
    const [reason, setReason] = useState("")
    const [dni, setDni] = useState<number | undefined>(undefined)

    async function onSubmit() {
        const {error} = await post<ValidationRequestResultProps, {}>("/validation-request/result", {
            id: request.id,
            result,
            reason,
            dni
        })
        return {error}
    }

    return <div className={"space-y-4"}>
        <div
            className="cursor-pointer"
            onClick={(e) => {
                setOpen(!open)
            }}
        >
            <div className={"flex gap-x-1 bg-[var(--background-dark)] p-4 rounded-lg  pointer-events-none"}>
            <span className={"font-bold rounded bg-[var(--primary)] px-2 mr-2"}>
                {request.tipo}
            </span>
                <ProfilePic user={request.user} className={"w-6 h-6 rounded-full"}/>
                <span className="truncate">
                <ContentTopRowAuthor author={request.user}/>
            </span>
                <span className="text-[var(--text-light)]">·</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(request.createdAt)}>
                <DateSince date={request.createdAt}/>
            </span>
            </div>
        </div>

        {open && <div className={"space-y-4 rounded-lg bg-[var(--background-dark)] p-4"}>
            {request.tipo == "persona" && <div className={"space-y-2"}>
                <FileViewer file={request.dniFrente}/>
                <FileViewer file={request.dniDorso}/>
            </div>}
            {request.tipo == "org" && <div className={"space-y-4 py-4"}>
                <div>
                    <div className={"text-[var(--text-light)]"}>
                        Tipo de organización
                    </div>
                    {request.tipoOrg}
                </div>
                <div>
                    <div className={"text-[var(--text-light)]"}>
                        Sitio web
                    </div>
                    {request.sitioWeb}
                </div>
                <div>
                    <div className={"text-[var(--text-light)]"}>
                        Comentarios
                    </div>
                    {request.comentarios}
                </div>
                <div>
                    <div className={"text-[var(--text-light)]"}>
                        Email
                    </div>
                    {request.email}
                </div>
                <div>
                    <div className={"text-[var(--text-light)]"}>
                        Documentación
                    </div>
                    <div className={"space-y-2 py-2"}>
                        {request.documentacion && request.documentacion.map((d, index) => {
                            return <div key={index}>
                                <FileViewer file={d}/>
                            </div>
                        })}
                    </div>
                </div>
            </div>}
            <div className={"flex space-x-4 items-center"}>
                <SelectionComponent
                    options={["accept", "reject"]}
                    onSelection={(v: string) => {
                        if (v == "accept" || v == "reject") setResult(v)
                    }}
                    selected={result}
                    optionsNodes={(o, isSelected) => {
                        return <button
                            className={"rounded-lg py-1 px-2 " + (isSelected ? o == "accept" ? "bg-[var(--primary)]" : "bg-[var(--red)]" : "")}>
                            {o == "accept" ? "Aceptar" : "Rechazar"}
                        </button>
                    }}
                    className={"flex space-x-2"}
                />
            </div>
            {result == "reject" && <div>
                <TextField
                    size={"small"}
                    multiline={true}
                    fullWidth={true}
                    minRows={2}
                    value={reason}
                    label={"Motivo"}
                    onChange={(e) => {
                        setReason(e.target.value)
                    }}
                />
            </div>}
            {result == "accept" && request.tipo == "persona" && <div>
                <TextField
                    size={"small"}
                    minRows={2}
                    value={dni ?? ""}
                    label={"DNI"}
                    type={"number"}
                    onChange={(e) => {
                        const value = parseInt(e.target.value)
                        setDni(isNaN(value) ? undefined : value)
                    }}
                />
            </div>}
            <div className={"flex justify-end space-x-2"}>
                <StateButton text1={"Enviar"} textClassName={"font-semibold"} onClick={onSubmit}/>
            </div>
        </div>}
    </div>
}


export const AdminValidation = () => {
    const {data, isLoading} = usePendingValidationRequests()

    if (isLoading) return <div className={"py-8"}>
        <LoadingSpinner/>
    </div>

    if (!data) return <div className={"py-8"}>Error</div>

    const {requests: pending, count} = data

    return <div className={"py-8 space-y-8 flex flex-col items-center"}>
        <h2>
            Solicitudes pendientes de revisión ({pending.length} de {count})
        </h2>
        <div className={"space-y-2 w-full"}>
            {pending.map((p, index) => {
                return <div key={p.id}>
                    <ValidationRequest request={p}/>
                </div>
            })}
        </div>
    </div>
}