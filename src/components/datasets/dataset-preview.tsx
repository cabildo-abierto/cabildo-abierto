"use client"
import {DatasetProps} from "@/lib/definitions";
import {FastPostPreviewFrame} from "../feed/fast-post-preview-frame";
import {Authorship} from "../feed/content-top-row-author";
import {DateSince} from "../../../modules/ui-utils/src/date";
import { FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"

import {contentUrl} from "../../utils/uri";

export const DatasetPreviewSmall = ({dataset, selected, onClick}: {dataset: DatasetProps, selected: boolean, onClick: () => void}) => {
    return <div className={"py-1 border rounded px-2 cursor-pointer hover:bg-[var(--background-dark2)] " + (selected ? "bg-[var(--background-dark2)]" : "")} onClick={onClick}>
        <div className={"flex justify-between space-x-1"}>
            <div className={"font-semibold text-[16px] break-all"}>
                {dataset.dataset.title}
            </div>
            <Link href={contentUrl(dataset.uri)} target={"_blank"} className={"text-[var(--text-light)]"} onClick={(e) => {e.stopPropagation()}}>
                <IconButton color={"inherit"}>
                    <FaExternalLinkAlt fontSize={12} color={"inherit"}/>
                </IconButton>
            </Link>
        </div>
        <div className={"text-[var(--text-light)] text-sm"}>
            {dataset.dataset.columns.length} columnas
        </div>
        <div className={"text-sm truncate text-[var(--text-light)]"}>
            Publicado por <Authorship content={dataset} onlyAuthor={true}/>
        </div>
        <div className={"flex justify-end text-[var(--text-light)] text-sm"}>
            <DateSince date={dataset.createdAt}/>
        </div>
    </div>
}


export const DatasetPreview = ({dataset}: { dataset: DatasetProps }) => {

    return <FastPostPreviewFrame
        post={dataset}
    >
        <div className={"flex flex-col"}>
            <div className={"font-semibold text-lg"}>
                {dataset.dataset.title}
            </div>
            <div className={"text-[var(--text-light)] flex space-x-2"}>
                <div>
                    {dataset.dataset.columns.length} columnas
                </div>
            </div>
        </div>
    </FastPostPreviewFrame>
}