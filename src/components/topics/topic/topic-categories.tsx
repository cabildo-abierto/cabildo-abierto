import Link from "next/link";


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
    return <div className={"flex gap-x-2 flex-wrap items-center gap-y-2 " + containerClassName} id={"topic-categories"}>
        {categories.slice(0, maxCount != null ? maxCount : categories.length).map((c, index) => {
            return <Link key={index} href={categoryUrl(c)} className={className} onClick={(e) => {e.stopPropagation()}}>
                {c}
            </Link>
        })}
    </div>
}


export default TopicCategories