"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import CloseIcon from '@mui/icons-material/Close';
import SearchSidebar from "./search-sidebar";
import { SearchButton } from "./top-bar";


export const UserSearchResult: React.FC<{result: any}> = ({ result }) => {
    return (
        <div className="flex justify-center mb-2">
            <Link href={"/perfil/" + result.id.replace("@", "")}>
                <button className="border border-gray-600 rounded scale-btn px-2 w-64 text-center">
                    {result.name}
                </button>
            </Link>
        </div>
    )
}


export const SearchInput: React.FC<any> = ({ onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return <input
    ref={inputRef}
    className="rounded-lg w-full transition duration-300 focus:outline-none"
    placeholder="buscar"
    onChange={onChange}
  />
}


const CloseSearchButton = ({ onClick }: any) => {
  return <div className="text-l text-gray-900 px-1 py-2">
      <button className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg" onClick={onClick}>
      <CloseIcon/>
  </button>
  </div>
}


const SearchBar: React.FC<any> = ({user, onClose}) => {
  const [searchValue, setSearchValue] = useState('')

  return <div className="flex">
      <SearchButton disabled={true}/>
      <div className="flex w-full">
        <SearchInput onChange={(e: any) => {setSearchValue(e.target.value)}} />
        <CloseSearchButton onClick={onClose}/>
      </div>
      {(searchValue.length != 0) && 
          <SearchSidebar user={user} searchValue={searchValue}/>
      }
  </div>
};

export default SearchBar;

