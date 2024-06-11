import { getPostsAndDiscussions } from "@/actions/get-comment";
import Feed from "@/components/feed";
import Link from "next/link";
import React from "react"


const Tema: React.FC = async ({params}) => {
    const feed = await getPostsAndDiscussions(params.id)
    const decodedName = decodeURIComponent(params.id || '');
    return <div className="mx-auto max-w-4xl bg-white border-l border-r h-full">
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
            {decodedName}
        </h1>
        <Feed contents={feed}/>
    </div>
}

export default Tema