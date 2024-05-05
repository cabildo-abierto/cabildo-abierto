"use client"

import React, {useState} from "react";
import {searchUsers} from "@/actions/search";
import Link from "next/link";

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
        placeholder="búsqueda"
        onChange={onChange}
    />
}

const Search: React.FC = () => {
    const [value, setValue] = useState('');
    const [results, setResults] = useState([])

    const handleContentChange = async (e) => {
        setValue(e.target.value)
        setResults(await searchUsers(value))
    };

    return (
        <div className="w-full">
        <div className="flex flex-col h-screen w-full">
                <div className="flex justify-center py-16">
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
    )
        ;
};

export default Search;

