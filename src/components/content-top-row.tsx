import { ReactNode } from "react"
import { ContentProps } from "../app/lib/definitions"
import { ContentTopRowAuthor } from "./content"
import { ContentOptionsButton } from "./content-options-button"
import { DateSince } from "./date"
import { FakeNewsCounter } from "./fake-news-counter"


type ContentTopRowProps = {
    content: {
        id: string
        isContentEdited: boolean
        createdAt: Date | string
        type: string
        author: {name: string, id: string}
        fakeReportsCount: number
    }
    author?: boolean
    icon: ReactNode
    showOptions?: boolean
    onShowFakeNews?: () => void
    showFakeNewsCounter?: boolean
    optionList?: string[]
}


export const ContentTopRow: React.FC<ContentTopRowProps> = ({
    content,
    author=true,
    icon=null,
    showOptions=false,
    optionList,
    onShowFakeNews,
    showFakeNewsCounter=false,
}) => {
    return <div className="flex justify-between pt-1 pr-1">
        <div className="px-2 blue-links flex items-center w-full">
            <div className="text-xs sm:text-sm space-x-1 text-[var(--text-light)]">
                {icon}
                {author && 
                    <ContentTopRowAuthor content={content}/>
                }
                <span className="">•</span>
                <span className="">
                    <DateSince date={content.createdAt}/>
                </span>
                {content.isContentEdited && <span className="">(editado)</span>}
            </div>
        </div>
        {showFakeNewsCounter && 
            <FakeNewsCounter content={content} onClick={onShowFakeNews}/>
        }
        {showOptions && optionList.length > 0 && <div className="flex">
            <ContentOptionsButton content={content} optionList={optionList}/>
        </div>}
    </div>
}

