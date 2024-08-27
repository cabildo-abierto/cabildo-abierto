"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import CloseIcon from '@mui/icons-material/Close';
import { SearchButton } from "./top-bar";
import { id2url } from "./content";
import AccountBoxIcon from '@mui/icons-material/AccountBox';

export const UserSearchResult: React.FC<{result: {id: string, name: string}}> = ({ result }) => {
    return (
        <div className="flex justify-center">
            <Link href={id2url(result.id)}>
                <button className="search-result items-center">
                  <div className="w-full flex">
                    <AccountBoxIcon/> <div className="w-full text-center">{result.name}</div>
                  </div>
                </button>
            </Link>
        </div>
    )
}


export const SearchInput: React.FC<{onChange: (arg: string) => void}> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return <input
    ref={inputRef}
    className="rounded-lg bg-[var(--background)] w-full transition duration-300 focus:outline-none"
    placeholder="buscar"
    onChange={(e) => {onChange(e.target.value)}}
  />
}


const CloseSearchButton = ({ onClick }: any) => {
  return <div className="text-l text-gray-900 px-1 py-2">
      <button className="topbar-btn" onClick={onClick}>
          <CloseIcon/>
      </button>
  </div>
}


const SearchBar: React.FC<{onClose: any, setSearchValue: any}> = ({onClose, setSearchValue}) => {

  return <>
    <div className="flex">
        <SearchButton disabled={true}/>
        <div className="flex w-full">
          <SearchInput onChange={setSearchValue}/>
          <CloseSearchButton onClick={() => {onClose(); setSearchValue("")}}/>
        </div>
    </div>
  </>
}

export default SearchBar;

