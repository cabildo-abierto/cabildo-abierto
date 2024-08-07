import { ContentProps } from "@/actions/get-content"
import { EntityProps } from "@/actions/get-entity"
import Link from "next/link"

export const EntitySearchResult: React.FC<{entity: EntityProps, content: ContentProps}> = ({ entity, content }) => {
    return <div className="flex justify-center mb-2">
        <Link href={"/wiki/" + entity.id.replace("@", "")}>
            <button className="border border-gray-600 rounded scale-btn px-2 w-64 text-center">
                {entity.name} {content.text.length == 0 ? <span className="text-red-600">(vacío)</span>: <></>} 
            </button>
        </Link>
    </div>
}