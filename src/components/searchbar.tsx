"use client"

import React, { useEffect, useRef } from "react";
import { CustomLink as Link } from './custom-link';
import { useSearch } from "./search/search-context";
import { CloseButton } from "./ui-utils/close-button";
import Image from 'next/image'
import {emptyChar, userUrl} from "./utils";
import {SearchButton} from "./ui-utils/search-button";
import ReadOnlyEditor from "./editor/read-only-editor";


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


export const SearchInput = ({autoFocus, className = "" }: {
  autoFocus: boolean,
    className?: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {searchState, setSearchState} = useSearch()

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
    }
  }, []);

  return <input
    ref={inputRef}
    className={"bg-transparent w-full focus:outline-none " + className}
    placeholder="buscar"
    value={searchState.value}
    onChange={(e) => {setSearchState({value: e.target.value, searching: true});}}
  />
}


const SearchBar: React.FC<{onClose: any, wideScreen: boolean, className?: string, autoFocus?: boolean}> = ({onClose, wideScreen, className="", autoFocus=false}) => {
    const {searchState, setSearchState} = useSearch()

    return wideScreen ?
        <div className="flex border rounded pl-3 pr-1">
            <div className="flex w-full">
                <SearchInput autoFocus={autoFocus} className={className}/>
            </div>
            <div className="text-[var(--accent)]">
                {!searchState.searching ? <SearchButton disabled={true}/> :
                <div className="py-1"><CloseButton onClose={() => {setSearchState({value: "", searching: false})}} size="small"/></div>}
            </div>
        </div> :
        <div className="flex border rounded pl-1 pr-1 w-full justify-between items-center">
            <div className={"text-[var(--accent)]"}>
                <SearchButton disabled={true}/>
            </div>
            <div className="flex w-full items-center">
                <SearchInput autoFocus={autoFocus} className={className}/>
                <div className={"py-1 " + (searchState.value.length == 0 ? "text-transparent" : "")}>
                    <CloseButton onClose={() => {onClose(); setSearchState({value: "", searching: false})}} size="small"/>
                </div>
            </div>
        </div>
}

export default SearchBar;

