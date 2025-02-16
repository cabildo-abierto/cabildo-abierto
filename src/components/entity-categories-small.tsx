import {currentCategories} from "./utils"
import Link from "next/link";


function categoryUrl(c: string){
  return "/inicio/" + c
}

export const TopicCategories = ({topic}: {topic: {versions: {categories?: string}[]}}) => {
  const categories = currentCategories(topic)

  return <div className="flex gap-x-2 flex-wrap items-center text-xs">
    {categories.map((c, index) => {
      return <Link key={index} href={categoryUrl(c)} className={"px-2 bg-[var(--background-dark2)] text-[var(--text-light)] rounded-lg hover:bg-[var(--background-dark3)]"}>
        {c}
      </Link>
    })}
  </div>
}