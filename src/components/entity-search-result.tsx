"use client"

import Link from "next/link"
import { ArticleIcon } from "./icons"

export const EntitySearchResult: React.FC<{entity: {id: string, name: string}}> = ({ entity }) => {
    
    return <div className="flex justify-center content-container">
        <Link href={"/articulo/" + entity.id}>
            <button className="search-result">
                <div className="flex w-full items-center">
                    <ArticleIcon/>
                    <div className="text-center w-full px-1">
                        {entity.name}
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}