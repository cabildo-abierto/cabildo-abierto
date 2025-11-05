"use client"
import {useState} from "react";
import {OrgType, OrgValidationRequestProps} from "@/components/ajustes/verificar/types";
import {FormItem, FormItemWithFiles} from "@/components/ajustes/verificar/form-item";
import BaseSelect from "@/components/layout/base/base-select";
import {produce} from "immer";
import {FormItemWithNote} from "@/components/ajustes/verificar/form-item-with-note";
import {BaseTextField} from "@/components/layout/base/base-text-field";
import {UploadFileButton} from "@/components/layout/utils/upload-file-button";
import {BaseTextArea} from "@/components/layout/base/base-text-area";
import {file2base64} from "@/utils/files";

export default function Page() {
    const [request, setRequest] = useState<Partial<OrgValidationRequestProps>>()

    return <div className={"space-y-6 pt-4"}>
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
            <UploadFileButton
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