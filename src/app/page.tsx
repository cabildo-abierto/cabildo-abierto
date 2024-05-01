import React from "react"
import Feed from "@/components/feed"

import { db } from '@/db'
import WriteButton from "../components/write_button";

export const getDiscussions = async () => {
  const feed = await db.discussion.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  })
  return feed
};



const Home: React.FC = async () => {
    const discussions = await getDiscussions()

    return (
        <>
            <div className="flex justify-center items-center mt-4">
                <Feed feed={discussions}/>
            </div>
            <WriteButton/>
        </>
    )
}

export default Home