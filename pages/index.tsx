'use client';

import React, {useState} from "react"
import { GetStaticProps } from "next"
import Feed from "../components/feed"
import { PostProps } from "../components/post"
import prisma from '../lib/prisma'
import WriteButton from "../components/write_button";
import NewDiscussion from "../components/new_discussion";

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
    const [showInput, setShowInput] = useState(false);
    const toggleInput = () => {
        setShowInput(prevState => !prevState);
    };

    const createDiscussion = (title, content) => {
        console.log("New discussion")
        console.log(title)
        console.log(content)
        toggleInput()
    }

    return (
        <>
            <div className="flex justify-center items-center mt-4">
                <div>
                <Feed feed={props.feed}/>

                {showInput && <NewDiscussion createDiscussion={createDiscussion}/>}
                </div>
            </div>
            {!showInput && (<WriteButton onClick={toggleInput}/>)}

        </>
    )
}

export default Home
