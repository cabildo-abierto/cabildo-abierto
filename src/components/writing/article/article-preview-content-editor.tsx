import {UploadImageButton} from "@/components/writing/write-panel/upload-image-button";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {getEditorSettings} from "@/components/writing/settings";
import React, {useState} from "react";
import {FieldError} from "@/components/ui/field";
import {BaseTextArea} from "@/components/layout/base/base-text-area";

export const ArticlePreviewContentEditor = ({
    title,
    summary,
    setSummary,
    thumbnail,
    setThumbnail
                                            }: {
    title: string
    summary: string
    setSummary: (s: string) => void
    thumbnail: ImagePayload
    setThumbnail: (i: ImagePayload) => void
}) => {

    return <div
        className={cn("border")}
    >
        <div className={"relative"}>
            {thumbnail && thumbnail.$type == "file" ? <Image
                src={thumbnail.src}
                alt={""}
                width={500}
                height={500}
                className={"max-h-[240px] object-cover"}
            /> : <div className={"h-12 border-b"}>
            </div>}
            <div className={"absolute right-2 bottom-2"}>
                <UploadImageButton
                    size={"small"}
                    onSubmit={setThumbnail}
                    text={thumbnail && thumbnail.$type == "file" ? "Cambiar imagen" : "Agregar imagen"}
                />
            </div>
        </div>

        <div className={"p-2"}>
            <div className={"flex justify-between w-full"}>
                <div className={"text-[11px] text-[var(--text-light)] uppercase"}>
                    Artículo
                </div>
            </div>
            <div className={"font-bold text-lg pb-1"}>
                {title}
            </div>
            <div className={"border-t pt-1 text-sm text-[var(--text-light)] article-preview-content"}>
                <BaseTextArea
                    inputGroupClassName={"border-none p-0"}
                    inputClassName={"p-0"}
                    value={summary}
                    onChange={e => {
                        e.stopPropagation();
                        setSummary(e.target.value)
                    }}
                />
                {summary.length > 225 && <FieldError>
                    Superaste el límite de 225 caracteres.
                </FieldError>}
            </div>
        </div>
    </div>

}