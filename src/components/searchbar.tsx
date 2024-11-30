"use client"

import React, { useEffect, useRef } from "react";
import { CustomLink as Link } from './custom-link';
import { SearchButton } from "./top-bar";
import { id2url } from "./content";
import { useSearch } from "./search-context";
import { CloseButton } from "./ui-utils/close-button";
import Image from 'next/image'


export const UserSearchResult: React.FC<{result: {displayName: string, handle: string, avatar: string}}> = ({ result }) => {
    const className = "px-2 py-1 w-72 text-center"

    console.log("result", result)

    return <div className="flex justify-center hover:bg-[var(--secondary-light)] content-container rounded"
    >
        <Link href={id2url(result.handle)}>
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
                        {result.displayName} <span className="text-[var(--text-light)]">@{result.handle}</span>
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}


export const SearchInput = ({ autoFocus }: {
  autoFocus: boolean
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
    className="bg-transparent w-full focus:outline-none"
    placeholder="buscar"
    value={searchState.value}
    onChange={(e) => {setSearchState({value: e.target.value, searching: true});}}
  />
}


const SearchBar: React.FC<{onClose: any, wideScreen: boolean}> = ({onClose, wideScreen}) => {
  const {searchState, setSearchState} = useSearch()

  return wideScreen ?
      <div className="flex border rounded pl-3 pr-1">
        <div className="flex w-full">
          <SearchInput autoFocus={false}/>
        </div>
        <div className="text-[var(--text-light)]">
          {!searchState.searching ? <SearchButton disabled={true}/> : 
          <div className="py-1"><CloseButton onClose={() => {setSearchState({value: "", searching: false})}} size="small"/></div>}
        </div>
      </div> : 
      <div className="flex border rounded pl-1 pr-1">
        <div className="text-[var(--text-light)] flex">
          <SearchButton disabled={true}/>
          <div className="flex w-full">
            <SearchInput autoFocus={true}/>
            <div className="py-1"><CloseButton onClose={() => {onClose(); setSearchState({value: "", searching: false})}} size="small"/>
            </div>
          </div>
        </div>
      </div>
}

export default SearchBar;

