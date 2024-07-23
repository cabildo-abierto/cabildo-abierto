"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SearchSidebar from "./search-sidebar";



export const UserSearchResult: React.FC<{result: any, isEntity: boolean}> = ({ result, isEntity }) => {
  const className = "transition transform ease-in-out px-1"

  return <div className="flex justify-center max-w-128 border rounded mb-2 hover:scale-105 transition duration-300 ease-in-out transform">
    <Link
      href={(isEntity ? "/wiki/" : "/perfil/") + result.id.replace("@", "")}
      className={className}>
      {result.name ? result.name : result.id}
    </Link>
  </div>
}

const SearchInput: React.FC<{ onChange: (e: any) => void }> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return <input
    ref={inputRef}
    className="rounded-lg w-128 px-4 py-1 focus:outline-none transition duration-300"
    placeholder="buscar"
    onChange={onChange}
  />
}

const CloseSearchButton: React.FC<any> = ({onClick}) => {
  return <div className="px-1">
    <button className="transparent-button rounded" onClick={onClick}>
      <CloseIcon/>
    </button>
  </div>
}


const SearchBar: React.FC<any> = ({onClose}) => {
  const [searchValue, setSearchValue] = useState('')

  return <div className="flex items-center justify-center">
      <SearchIcon/>
      <div className="flex justify-center items-center">
        <SearchInput onChange={(e) => {setSearchValue(e.target.value)}} />
        <CloseSearchButton onClick={onClose}/>
      </div>
      {(searchValue.length != 0) && 
          <div className="fixed right-0 top-16 z-10">
              <SearchSidebar searchValue={searchValue}/>
          </div>
      }
  </div>
};

export default SearchBar;

