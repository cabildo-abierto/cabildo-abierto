"use client"

import Link from "next/link"
import ArticleIcon from '@mui/icons-material/Article';

export const EntitySearchResult: React.FC<{entity: {id: string, name: string}}> = ({ entity }) => {
    
    return <div className="flex justify-center mb-2">
        <Link href={"/articulo/" + entity.id}>
            <button className="search-result">
                <div className="flex w-full items-center">
                    <ArticleIcon/>
                    <div className="text-center w-full">
                        <div>
                            {entity.name}
                        </div>
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}