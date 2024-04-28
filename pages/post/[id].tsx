import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import { PostProps } from "../../components/post"
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: post,
  };
};

const PostPage: React.FC<PostProps> = (props) => {
  let title = props.title
  if (!props.published) {
    title = `${title} (Draft)`
  }

  return (
      <>
        <div className="flex justify-center items-center mt-4">
          <div>
          <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-2">Iniciada por: {props?.author?.name || "Unknown author"}</p>
            <div className="text-gray-800">{props.content}</div>
          </div>
          <p className="text-gray-600 mb-2 ml-4">Comments</p>
          </div>
        </div>
      </>
  )
}

export default PostPage
