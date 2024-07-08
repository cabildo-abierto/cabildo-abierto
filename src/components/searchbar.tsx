"use client"

import React, { useEffect, useState } from "react";
import { searchUsers, searchContents, searchEntities } from "@/actions/search";
import { UserProps } from "@/actions/get-user";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content";
import ContentComponent from "@/components/content";
import { EntityProps } from "@/actions/get-entity";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';



export const UserSearchResult: React.FC<{ result: UserProps | EntityProps, isEntity: boolean }> = ({ result, isEntity }) => {
  const className = "transition transform ease-in-out px-1"

  return <div style={{ fontFamily: "Lato" }} className="flex justify-center w-64 border rounded mb-2 hover:scale-105 transition duration-300 ease-in-out transform">
    <Link
      href={(isEntity ? "/entidad/" : "/perfil/") + result.id}
      className={className}>
      {result.name ? result.name : "@" + result.username}
    </Link>
  </div>
}

const SearchInput: React.FC<{ onChange: (e: any) => void }> = ({ onChange }) => {
  return <input
    className="rounded-lg w-128 px-4 py-1 focus:outline-none transition duration-300"
    placeholder="buscar"
    onChange={onChange}
  />
}

const SelectionComponent: React.FC<{ selectionHandler: (arg: string) => void }> = ({ selectionHandler }) => {
  const [selectedButton, setSelectedButton] = useState("users");

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
    selectionHandler(button);
  };

  return <>
      <button
        className={`${selectedButton === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('users')}
      >
        Usuarios
      </button>
      <button
        className={`${selectedButton === 'contents' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('contents')}
      >
        Publicaciones
      </button>
      <button
        className={`${selectedButton === 'entities' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          } py-2 px-4 flex-grow focus:outline-none`}
        onClick={() => handleButtonClick('entities')}
      >
        Entidades
      </button>
  </>
};


const SearchPage = ({searchValue}) => {
  const [resultsUsers, setResultsUsers] = useState<UserProps[]>([]);
  const [resultsContents, setResultsContents] = useState<ContentProps[]>([]);
  const [resultsEntities, setResultsEntities] = useState<EntityProps[]>([]);
  const [searchType, setSearchType] = useState("users");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const search = async () => {
      setResultsUsers(await searchUsers(searchValue))
      setResultsContents(await searchContents(searchValue))
      setResultsEntities(await searchEntities(searchValue))
  }

  const handleTypeChange = (t) => {
    search()
    setSearchType(t)
  }

  const searchResults = () => {
    if (searchType == "users") {
      return resultsUsers.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <UserSearchResult result={result} isEntity={false} />
        </div>
      ))
    } else if (searchType == "contents") {
      return resultsContents.map((result) => (
        <div className="py-2" key={result.id}>
          <ContentComponent content={result} isMainContent={false} />
        </div>
      ))
    } else {
      return resultsEntities.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <UserSearchResult result={result} isEntity={true} />
        </div>
      ))
    }
  }

  return <div className="w-screen h-screen bg-white bg-opacity-50">
      <div className="flex justify-center h-full">
          <div className="bg-white h-full" style={{width: "800px"}}>
              <div className="flex justify-center">
                  <SelectionComponent selectionHandler={handleTypeChange} />
              </div>
              <div className="flex justify-center">
                  <div className="mt-4 w-full px-8">
                      <div className="w-full">
                          {searchResults()}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
}

const CloseSearchButton = ({onClick}) => {
  return <div className="px-1">
    <button className="transparent-button rounded" onClick={onClick}>
      <CloseIcon/>
    </button>
  </div>
}


const SearchBar: React.FC = ({onClose}) => {
  const [searchValue, setSearchValue] = useState('')

  return <div className="flex items-center justify-center">
      <SearchIcon/>
      <div className="flex justify-center items-center">
        <SearchInput onChange={(e) => {setSearchValue(e.target.value)}} />
        <CloseSearchButton onClick={onClose}/>
      </div>
      {(searchValue.length != 0) && 
          <div className="fixed left-0 top-16 z-10">
              <SearchPage searchValue={searchValue}/>
          </div>
      }
  </div>
};

export default SearchBar;

