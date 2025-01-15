"use client"

import React, { useEffect, useRef } from "react";
import { CustomLink as Link } from './custom-link';
import { SearchButton } from "./top-bar";
import { useSearch } from "./search/search-context";
import { CloseButton } from "./ui-utils/close-button";
import Image from 'next/image'
import { userUrl } from "./utils";


export const UserSearchResult: React.FC<{result: {displayName?: string, handle: string, avatar?: string}}> = ({ result }) => {
    const className = "px-2 py-1 w-72 text-center h-full"

    return <Link href={userUrl(result.handle)} className="flex justify-center hover:bg-[var(--background-dark)] content-container rounded h-14">
        <button className={className}>
            <div className="flex w-full items-center">
                <Image
                  src={result.avatar}
                  alt={"Foto de perfil de @" + result.handle}
                  width={100}
                  height={100}
                  className="rounded-full h-8 w-8"
                />
                <div className="text-center w-full px-1">
                    {result.displayName ? result.displayName : undefined} <span className="text-[var(--text-light)]">@{result.handle}</span>
                </div>
            </div>
        </button>
    </Link>
}


export const SearchInput = ({ autoFocus, className="" }: {
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


const SearchBar: React.FC<{onClose: any, wideScreen: boolean, className?: string}> = ({onClose, wideScreen, className=""}) => {
    const {searchState, setSearchState} = useSearch()

    return wideScreen ?
        <div className="flex border rounded pl-3 pr-1">
            <div className="flex w-full">
                <SearchInput autoFocus={false} className={className}/>
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
                <SearchInput autoFocus={true} className={className}/>
                <div className={"py-1 " + (searchState.value.length == 0 ? "text-transparent" : "")}>
                    <CloseButton onClose={() => {onClose(); setSearchState({value: "", searching: false})}} size="small"/>
                </div>
            </div>
        </div>
}

export default SearchBar;

