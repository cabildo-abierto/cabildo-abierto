"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import CloseIcon from '@mui/icons-material/Close';
import { SearchButton } from "./top-bar";
import { id2url } from "./content";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { ArticleIcon } from "./icons";

export const UserSearchResult: React.FC<{result: {id: string, name: string}}> = ({ result }) => {
    return <div className="flex justify-center content-container">
        <Link href={id2url(result.id)}>
            <button className="search-result">
                <div className="flex w-full items-center">
                    <AccountBoxIcon fontSize="small"/>
                    <div className="text-center w-full px-1">
                        {result.name} @{result.id}
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}


export const SearchInput: React.FC<{onChange: (arg: string) => void, autoFocus: boolean}> = ({ onChange, autoFocus }) => {
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
    onChange={(e) => {onChange(e.target.value)}}
  />
}


const CloseSearchButton = ({ onClick }: any) => {
  return <div className="text-l text-gray-900 px-1">
      <button className="topbar-btn" onClick={onClick}>
          <CloseIcon/>
      </button>
  </div>
}


const SearchBar: React.FC<{onClose: any, setSearchValue: any, wideScreen: boolean}> = ({onClose, setSearchValue, wideScreen}) => {


  return wideScreen ?
      <div className="flex border pl-3 pr-1">
        <div className="flex w-full">
          <SearchInput onChange={setSearchValue} autoFocus={false}/>
        </div>
        <div className="text-[var(--text-light)]">
          <SearchButton disabled={true}/>
        </div>
      </div> : 
      <div className="flex border pl-1 pr-1">
        <div className="text-[var(--text-light)] flex">
          <SearchButton disabled={true}/>
          <div className="flex w-full">
            <SearchInput onChange={setSearchValue} autoFocus={true}/>
            <CloseSearchButton onClick={() => {onClose(); setSearchValue("")}}/>
          </div>
        </div>
      </div>
}

export default SearchBar;

