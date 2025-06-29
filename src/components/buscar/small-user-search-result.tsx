import React from "react";
import {useSearch} from "@/components/buscar/search-context";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {profileUrl} from "@/utils/uri";
import Image from "next/image";
import {emptyChar} from "@/utils/utils";


const SmallUserSearchResult: React.FC<{
    result: { displayName?: string, handle: string, avatar?: string, description?: string }
    className?: string
    onClick?: (handle: string) => void
}> = ({result, className="", onClick}) => {

    return <Link
        href={profileUrl(result.handle)}
        onClick={() => {if(onClick) onClick(result.handle); }}
        className={"flex flex-col hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] p-2 " + className}
    >
        <div className={"flex space-x-4 items-center"}>
            {result.avatar ? <Image
                src={result.avatar}
                alt={"Foto de perfil de @" + result.handle}
                width={100}
                height={100}
                className="rounded-full h-10 w-10"
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col ">
                <div className={"truncate whitespace-nowrap text-sm max-w-[200px]"}>
                    {result.displayName ? result.displayName : <>@{result.handle}</>}
                </div>
                <div className={"truncate whitespace-nowrap max-w-[200px]"}>
                    {result.displayName && <span className="text-[var(--text-light)] text-sm">@{result.handle}</span>}
                </div>
            </div>
        </div>
    </Link>
}

export default SmallUserSearchResult;