"use client"

import React, { useEffect, useRef } from "react";
import Link from "next/link";

import CloseIcon from '@mui/icons-material/Close';
import { SearchButton } from "./top-bar";
import { id2url } from "./content";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useSearch } from "./search-context";


export const UserSearchResult: React.FC<{result: {id: string, name: string}}> = ({ result }) => {
    const className = "px-2 py-1 w-72 text-center hover:bg-[var(--secondary-light)]"

    return <div className="flex justify-center content-container">
        <Link href={id2url(result.id)}>
            <button className={className}>
                <div className="flex w-full items-center">
                    <AccountBoxIcon fontSize="small"/>
                    <div className="text-center w-full px-1">
                        {result.name} <span className="text-[var(--text-light)]">@{result.id}</span>
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}


export const SearchInput = ({ onChange, autoFocus, searchValue }: {
  onChange: (arg: string) => void,
  autoFocus: boolean,
  searchValue: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      inputRef.current.focus();
    }
  }, []);

  return <input
    ref={inputRef}
    className="bg-transparent w-full focus:outline-none"
    placeholder="buscar"
    value={searchValue}
    onChange={(e) => {onChange(e.target.value)}}
  />
}


const CloseSearchButton = ({ onClick }: any) => {
  return <div className="text-l text-gray-900 p-1 flex justify-center items-center">
      <button className="hover:bg-[var(--secondary-light)] rounded-lg" onClick={onClick}>
          <CloseIcon/>
      </button>
  </div>
}


const SearchBar: React.FC<{onClose: any, setSearchValue: any, wideScreen: boolean}> = ({onClose, setSearchValue, wideScreen}) => {
  const {searchValue} = useSearch()

  return wideScreen ?
      <div className="flex border pl-3 pr-1">
        <div className="flex w-full">
          <SearchInput searchValue={searchValue} onChange={setSearchValue} autoFocus={false}/>
        </div>
        <div className="text-[var(--text-light)]">
          {searchValue.length == 0 ? <SearchButton disabled={true}/> : 
          <CloseSearchButton onClick={() => {setSearchValue("")}}/>}
        </div>
      </div> : 
      <div className="flex border pl-1 pr-1">
        <div className="text-[var(--text-light)] flex">
          <SearchButton disabled={true}/>
          <div className="flex w-full">
            <SearchInput onChange={setSearchValue} autoFocus={true} searchValue={searchValue}/>
            <CloseSearchButton onClick={() => {onClose(); setSearchValue("")}}/>
          </div>
        </div>
      </div>
}

export default SearchBar;

