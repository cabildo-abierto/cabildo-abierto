"use client"

import React, { useEffect, useRef } from "react";
import { CustomLink as Link } from '../ui-utils/custom-link';
import { useSearch } from "./search-context";
import { CloseButton } from "../ui-utils/close-button";
import Image from 'next/image'
import {emptyChar, userUrl} from "../utils/utils";
import {SearchButton} from "../ui-utils/search-button";
import ReadOnlyEditor from "../editor/read-only-editor";
import {TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";


export const UserSearchResult: React.FC<{result: {displayName?: string, handle: string, avatar?: string, description?: string}}> = ({ result }) => {

    return <Link href={userUrl(result.handle)}
         className="flex flex-col hover:bg-[var(--background-dark)] border-b p-3">
        <div className={"flex space-x-4 ml-4"}>
            {result.avatar ? <Image
              src={result.avatar}
              alt={"Foto de perfil de @" + result.handle}
              width={100}
              height={100}
              className="rounded-full h-14 w-14"
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col">
                {result.displayName ? result.displayName : <>@{result.handle}</>}
                {result.displayName && <span className="text-[var(--text-light)]">@{result.handle}</span>}
                {result.description && result.description.length > 0 && <div className={"text-sm mt-1"}>
                    <ReadOnlyEditor initialData={result.description}/>
                </div>}
            </div>
        </div>
    </Link>
}


export const SmallUserSearchResult: React.FC<{result: {displayName?: string, handle: string, avatar?: string, description?: string}}> = ({ result }) => {
    const {setSearchState} = useSearch()

    return <Link href={userUrl(result.handle)}
                 onClick={() => {setSearchState({value: "", searching: false})}}
                 className="flex flex-col hover:bg-[var(--background-dark)] border-b p-2">
        <div className={"flex space-x-4 items-center"}>
            {result.avatar ? <Image
                src={result.avatar}
                alt={"Foto de perfil de @" + result.handle}
                width={100}
                height={100}
                className="rounded-full h-10 w-10"
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col">
                {result.displayName ? result.displayName : <>@{result.handle}</>}
                {result.displayName && <span className="text-[var(--text-light)] text-sm">@{result.handle}</span>}
            </div>
        </div>
    </Link>
}


const SearchBar = ({
    autoFocus=false,
    paddingY
}: {
    autoFocus?: boolean
    paddingY?: string
}) => {
    const {searchState, setSearchState} = useSearch()

    return <div>
        <TextField
            size={"small"}
            autoFocus={autoFocus}
            fullWidth={true}
            value={searchState.value}
            placeholder={"buscar"}
            onFocus={() => setSearchState({value: searchState.value, searching: true})}
            onChange={(e) => {setSearchState({value: e.target.value, searching: true});}}
            slotProps={{
                input: {
                    startAdornment: <span className={"text-[var(--text-light)] mr-2"}><SearchIcon color={"inherit"}/></span>,
                    endAdornment: searchState.value.length > 0 ? <CloseButton size="small" onClose={() => {setSearchState({value: "", searching: false})}}/> : undefined
                },
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    "& input": {
                        paddingY: paddingY
                    },
                    "& fieldset": {
                        borderColor: "var(--accent)",
                    },
                    "&:hover fieldset": {
                        borderColor: "var(--accent)",
                    },
                    "&.Mui-focused fieldset": {
                        borderWidth: "2px",
                        borderColor: "var(--accent)",
                    },
                },
            }}
        />
    </div>
}

export default SearchBar;

