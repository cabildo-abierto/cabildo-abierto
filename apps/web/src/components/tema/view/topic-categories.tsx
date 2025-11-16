import {cn} from "@/lib/utils";
import {CustomLink} from "@/components/utils/base/custom-link";


function categoryUrl(c: string) {
    return "/temas?view=lista&c=" + c
}


const TopicCategories = ({
                             categories,
                             maxCount,
                             containerClassName = "text-xs",
                             className = "px-2 bg-[var(--background-dark2)] truncate text-[var(--text-light)] rounded-lg hover:bg-[var(--background-dark3)]"
                         }: {
    categories: string[]
    className?: string
    maxCount?: number
    containerClassName?: string
}) => {

    return <div
        className={cn("flex truncate space-x-2 items-center", containerClassName)}
        id={"topic-categories"}
    >
        {categories.slice(0, maxCount != null ? maxCount : categories.length).map((c, index) => {
            return <CustomLink
                tag={"span"}
                key={index}
                className={className}
                href={categoryUrl(c)}
            >
                {c}
            </CustomLink>
        })}
        {maxCount && categories.length > maxCount && <span className={containerClassName + " " + className}>
            ...
        </span>}
    </div>
}


export default TopicCategories