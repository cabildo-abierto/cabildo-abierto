"use client"

import Link from "next/link"
import ArticleIcon from '@mui/icons-material/Article';

export type SmallEntityProps = {
    id: string,
    name: string
}

export const EntitySearchResult: React.FC<{entity: SmallEntityProps}> = ({ entity }) => {
    return <div className="flex justify-center mb-2">
        <Link href={"/articulo/" + entity.id.replace("@", "")}>
            <button className="search-result">
                <div className="flex items-center">
                    <span className="px-1"><ArticleIcon/></span>
                    <div className="flex justify-center w-full">
                        <div>
                            {entity.name}
                        </div>
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}