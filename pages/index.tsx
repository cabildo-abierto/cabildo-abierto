import React from "react"
import { GetStaticProps } from "next"
import Feed from "../components/feed"
import { PostProps } from "../components/post"
import prisma from '../lib/prisma'
import WriteButton from "../components/write_button";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { feed },
    revalidate: 10,
  };
};

type Props = {
  feed: PostProps[]
}

const Home: React.FC<Props> = (props) => {
  return (
      <>
        <div className="flex justify-center items-center">
          <Feed feed={props.feed}/>
        </div>
        <WriteButton/>
      </>
  )
}

export default Home
