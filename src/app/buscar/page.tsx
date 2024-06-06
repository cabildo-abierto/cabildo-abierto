"use client"

import React, {useState} from "react";
import {searchUsers, searchLaws} from "@/actions/search";
import Link from "next/link";
import {debounce} from "next/dist/server/utils";

function SearchResult({result}){
    return <div className="border mb-2">
        <Link
            href={"/profile/" + result.id}
            className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-base px-1`}>
            {result.name ? result.name : "@"+result.username}
        </Link>
    </div>
}

function SearchBar({onChange}) {
    return <input
        className="rounded-lg w-1/2 px-4 text-lg border-2 border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500 hover:shadow-lg transition duration-300"
        placeholder="buscar"
        onChange={onChange}
    />
}

const Search: React.FC = () => {
    const [results, setResults] = useState([]);
    const [searchType, setSearchType] = useState("personas");

    const debouncedSearch = debounce(async (searchValue) => {
        if(searchType == "personas"){
            const searchResults = await searchUsers(searchValue);
        } else {
            const searchResults = await searchLaws(searchValue);
        }
        setResults(searchResults);
    }, 300);

    const handleContentChange = (e) => {
        const searchValue = e.target.value;
        debouncedSearch(searchValue);
    };

    return (
        <div className="w-full">
            <div className="flex flex-col h-screen w-full">
                <div className="flex justify-center py-24">
                    <SearchBar onChange={handleContentChange} />
                </div>
                <div className="px-8">
                    {results.map((result) => (
                        <div key={result.id}>
                            <SearchResult result={result}/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Search;

