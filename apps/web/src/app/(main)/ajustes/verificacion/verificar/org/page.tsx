"use client"
import {useState} from "react";
import {OrgType, OrgValidationRequestProps} from "@cabildo-abierto/api";
import {FormItem, FormItemWithFiles} from "@/components/ajustes/verificar/form-item";
import {BaseSelect} from "@/components/utils/base/base-select";
import {produce} from "immer";
import {FormItemWithNote} from "@/components/ajustes/verificar/form-item-with-note";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {UploadFileButton} from "@/components/utils/upload-file-button";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {file2base64} from "@/components/utils/react/files";
import {Note} from "@/components/utils/base/note";
import {SendButton} from "@/components/ajustes/verificar/send-button";


export default function Page() {
    const [request, setRequest] = useState<Partial<OrgValidationRequestProps>>({tipo: "org", tipoOrg: "creador-individual"})

    return <div className={"space-y-6"}>
        <Note className={"text-left"}>
            Adjuntá la documentación necesaria para identificar a tu organización y validar que sos su representante.
        </Note>
        <FormItem label={"Tipo de organización"}>
            <div>
                <BaseSelect
                    triggerClassName={"min-w-52"}
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
                    value={request.tipoOrg}
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
            <UploadFileButton
                size={"small"}
                multiple={true}
                onUpload={async (files) => {
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
                }}
            >
                Subir archivos
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
        <div className={"flex justify-end"}>
            <SendButton request={request}/>
        </div>
    </div>
}