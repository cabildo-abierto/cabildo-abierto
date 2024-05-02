import React from "react"
import { DiscussionProps } from "@/components/discussion"
import { db } from '@/db'

const getDiscussion = async ({ params }) => {
  return await db.discussion.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
};

const DiscussionPage: React.FC = async ({params}) => {
  const discussion = await getDiscussion({params})
  let title = discussion.title
  if (!discussion.published) {
    title = `${title} (Draft)`
  }

  return (
      <>
        <div className="flex justify-center items-center mt-4">
          <div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-2">Iniciada por: {discussion?.author?.name || "Unknown author"}</p>
            <div className="text-gray-800">{discussion.content}</div>
          </div>
          <p className="text-gray-600 mb-2 ml-4">Comentarios</p>
          </div>
        </div>
      </>
  )
}

export default DiscussionPage
