import { ContentProps } from "@/actions/get-content"
import { EntityProps } from "@/actions/get-entity"
import Link from "next/link"
import ArticleIcon from '@mui/icons-material/Article';

export const EntitySearchResult: React.FC<{entity: EntityProps, content: ContentProps}> = ({ entity, content }) => {
    return <div className="flex justify-center mb-2">
        <Link href={"/articulo/" + entity.id.replace("@", "")}>
            <button className="search-result">
                <div className="flex items-center">
                    <span className="px-1"><ArticleIcon/></span>
                    <div className="flex justify-center w-full">
                        <div>
                            {entity.name} {content.text.length == 0 ? <span className="text-[var(--secondary)]">(vacío)</span>: <></>}
                        </div>
                    </div>
                </div>                  
            </button>
        </Link>
    </div>
}