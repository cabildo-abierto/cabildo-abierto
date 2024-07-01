"use client"

import React, {useState} from "react";
import {searchUsers, searchContents, searchEntities} from "@/actions/search";
import {UserProps} from "@/actions/get-user";
import Link from "next/link";
import { ContentProps } from "@/actions/get-comment";
import ContentComponent from "@/components/content";
import { EntityProps } from "@/actions/get-entity";


export const UserSearchResult: React.FC<{result: UserProps | EntityProps, isEntity: boolean}> = ({result, isEntity}) => {
    const className = "hover:scale-125 transition transform ease-in-out px-1"
    
    return <div className="border rounded mb-2 hover:scale-105 transition duration-300 ease-in-out transform">
        <Link 
            href={(isEntity ? "/entidad/" : "/profile/") + result.id}
            className={className}>
            {result.name ? result.name : "@"+result.username}
        </Link>
    </div>
}


const SearchBar: React.FC<{onChange: (e: any) => void}> = ({onChange}) => {
    return <input
        className="rounded-lg w-1/2 px-4 text-lg border-2 border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500 hover:shadow-lg transition duration-300"
        placeholder="..."
        onChange={onChange}
    />
}

const SelectionComponent: React.FC<{ selectionHandler: (arg: string) => void }> = ({ selectionHandler }) => {
    const [selectedButton, setSelectedButton] = useState("users");
  
    const handleButtonClick = (button: string) => {
      setSelectedButton(button);
      selectionHandler(button);
    };
  
    return (
      <div className="flex justify-center mt-8">
        <button
          className={`${selectedButton === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } py-2 px-4 rounded-l flex-grow focus:outline-none`}
          onClick={() => handleButtonClick('users')}
        >
          Usuarios
        </button>
        <button
          className={`${selectedButton === 'contents' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } py-2 px-4 rounded-r flex-grow focus:outline-none`}
          onClick={() => handleButtonClick('contents')}
        >
          Publicaciones
        </button>
        <button
          className={`${selectedButton === 'entities' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } py-2 px-4 rounded-r flex-grow focus:outline-none`}
          onClick={() => handleButtonClick('entities')}
        >
          Entidades
        </button>
      </div>
    );
  };

const Search: React.FC = () => {
    const [searchValue, setSearchValue] = useState('')
    const [resultsUsers, setResultsUsers] = useState<UserProps[]>([]);
    const [resultsContents, setResultsContents] = useState<ContentProps[]>([]);
    const [resultsEntities, setResultsEntities] = useState<EntityProps[]>([]);
    const [searchType, setSearchType] = useState("users");

    const search = async () => {
        setResultsUsers(await searchUsers(searchValue))
        setResultsContents(await searchContents(searchValue))
        setResultsEntities(await searchEntities(searchValue))
    }

    const handleContentChange: (e:any) => void = (e) => {
        setSearchValue(e.target.value)
    };

    const handleTypeChange = (t) => {
        search()
        setSearchType(t)
    }

    const searchResults = () => {
      if(searchType == "users"){
          return resultsUsers.map((result) => (
            <div key={result.id}>
                <UserSearchResult result={result} isEntity={false}/>
            </div>
          ))
      } else if(searchType == "posts") {
          return resultsContents.map((result) => (
            <div key={result.id}>
                <ContentComponent content={result} isMainContent={false}/>
            </div>
          ))
      } else {
        return resultsEntities.map((result) => (
          <div key={result.id}>
              <UserSearchResult result={result} isEntity={true}/>
          </div>
        ))
      }
    }

    return (
        <div className="w-full">
            <div className="flex flex-col h-screen w-full">
                <div className="flex justify-center mt-24">
                    <SearchBar onChange={handleContentChange} />
                    <button
                        onClick={search}
                        disabled={searchValue.length == 0}
                        className={`ml-3 py-2 px-4 rounded font-bold transition duration-200 ${searchValue.length == 0 ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                        }`}
                    >
                        Buscar
                    </button>
                </div>
                <SelectionComponent selectionHandler={handleTypeChange}/>
                <div className="px-8 mt-4">
                    {searchResults()}
                </div>
            </div>
        </div>
    );
};

export default Search;

