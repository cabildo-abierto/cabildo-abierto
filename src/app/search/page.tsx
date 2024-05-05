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

const Search: React.FC = () => {
    const [value, setValue] = useState('');
    const [results, setResults] = useState([])

    const handleContentChange = async (e) => {
        setValue(e.target.value)
        setResults(await searchUsers(value))
    };

    return (
        <div className="w-full">
            <div className="flex flex-col border-l border-r h-screen w-full">
                <h1 className="text-2xl ml-4 mt-8 font-semibold">
                    Buscá lo que quieras
                </h1>
                <div className="px-8 py-4">
                    <input className="rounded-lg w-full px-4 text-lg border focus:outline-none focus:ring-1 focus:ring-gray-500"
                        placeholder=""
                        onChange={handleContentChange}
                    />
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

