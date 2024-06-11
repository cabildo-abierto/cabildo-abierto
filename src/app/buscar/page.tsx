"use client"

import React, {useState} from "react";
import {searchUsers, searchContents} from "@/actions/search";
import {UserProps} from "@/actions/get-user";
import Link from "next/link";
import {debounce} from "next/dist/server/utils";
import { ContentProps } from "@/actions/get-comment";
import ContentComponent from "@/components/content";


const UserSearchResult: React.FC<{result: UserProps}> = ({result}) => {
    return <div className="border mb-2">
        <Link
            href={"/profile/" + result.id}
            className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-base px-1`}>
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
      </div>
    );
  };

const Search: React.FC = () => {
    const [searchValue, setSearchValue] = useState('')
    const [resultsUsers, setResultsUsers] = useState<UserProps[]>([]);
    const [resultsContents, setResultsContents] = useState<ContentProps[]>([]);
    const [searchType, setSearchType] = useState("users");

    const search = async () => {
        setResultsUsers(await searchUsers(searchValue))
        setResultsContents(await searchContents(searchValue))
    }

    const handleContentChange: (e:any) => void = (e) => {
        setSearchValue(e.target.value)
    };

    const handleTypeChange = (t) => {
        search()
        setSearchType(t)
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
                    {searchType == "users" ? 
                        resultsUsers.map((result) => (
                            <div key={result.id}>
                                <UserSearchResult result={result}/>
                            </div>
                        )) : resultsContents.map((result) => (
                            <div key={result.id}>
                                <ContentComponent content={result} isMainContent={false}/>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default Search;

