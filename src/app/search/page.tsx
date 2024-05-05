"use client"

import React, {useState} from "react";
import AutoExpandingTextarea from "@/components/autoexpanding_textarea"
import { createComment } from '@/actions/create-comment'
import {useRouter} from "next/navigation";

const Search: React.FC = () => {
    const [value, setValue] = useState('');

    const handleContentChange = (e) => {
        setValue(e.target.value)
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
            </div>
    </div>
)
    ;
};

export default Search;

