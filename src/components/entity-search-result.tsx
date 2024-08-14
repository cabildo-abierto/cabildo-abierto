import { ContentProps } from "@/actions/get-content"
import { EntityProps } from "@/actions/get-entity"
import Link from "next/link"

export const EntitySearchResult: React.FC<{entity: EntityProps, content: ContentProps}> = ({ entity, content }) => {
    return <div className="flex justify-center mb-2">
        <Link href={"/wiki/" + entity.id.replace("@", "")}>
            <button className="search-result">
                {entity.name} {content.text.length == 0 ? <span className="text-[var(--secondary)]">(vacío)</span>: <></>} 
            </button>
        </Link>
    </div>
}