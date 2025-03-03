import Link from "next/link";


function categoryUrl(c: string){
  return "/inicio/" + c
}

export const TopicCategories = ({
    categories,
    maxCount,
    className="px-2 bg-[var(--background-dark2)] text-[var(--text-light)] rounded-lg hover:bg-[var(--background-dark3)]"
}: {
  categories: string[]
  className?: string
  maxCount?: number
}) => {
  return <div className="flex gap-x-2 flex-wrap items-center text-xs">
    {categories.slice(0, maxCount != null ? maxCount : categories.length).map((c, index) => {
      return <Link key={index} href={categoryUrl(c)} className={className}>
        {c}
      </Link>
    })}
  </div>
}