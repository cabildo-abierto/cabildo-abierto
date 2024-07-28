"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SearchSidebar from "./search-sidebar";
import { useUsers } from "./use-users";
import { useEntities } from "./use-entities";
import { SearchButton } from "./top-bar";
import { useContents } from "./use-contents";



export const UserSearchResult: React.FC<{result: any}> = ({ result }) => {
  const {users, setUsers} = useUsers()

  return (
      <div className="flex justify-center mb-2">
          <Link href={"/perfil/" + result.id.replace("@", "")}>
              <button className="border border-gray-600 rounded scale-btn px-2 w-64 text-center">
                  {users ? users[result.id].name : "Cargando..."}
              </button>
          </Link>
      </div>
  )
}


export const EntitySearchResult: React.FC<{result: any}> = ({ result }) => {
    const {entities} = useEntities()
    const {contents} = useContents()
    if(!entities || !contents) return <></>

    const entity = entities[result.id]
    const content = contents[entity.contentId]
    return <div className="flex justify-center mb-2">
        <Link href={"/wiki/" + result.id.replace("@", "")}>
            <button className="border border-gray-600 rounded scale-btn px-2 w-64 text-center">
                {entity.name} {content.text.length == 0 ? <span className="text-red-600">(vacío)</span>: <></>} 
            </button>
        </Link>
    </div>
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
    className="rounded-lg w-128 transition duration-300 focus:outline-none"
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


const SearchBar: React.FC<any> = ({onClose}) => {
  const [searchValue, setSearchValue] = useState('')

  return <div className="flex">
      <SearchButton disabled={true}/>
      <SearchInput onChange={(e: any) => {setSearchValue(e.target.value)}} />
      <CloseSearchButton onClick={onClose}/>
      {(searchValue.length != 0) && 
          <div className="fixed right-0 top-16 z-10">
              <SearchSidebar searchValue={searchValue}/>
          </div>
      }
  </div>
};

export default SearchBar;

