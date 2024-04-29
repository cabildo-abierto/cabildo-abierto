'use client';

import React, {useState} from "react"
import {GetServerSideProps, GetStaticProps} from "next"
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
    props: { feed }
  };
};

type Props = {
  feed: PostProps[]
}

const addDiscussion = async (discussionData) => {
    try {
        const response = await fetch('/api/addDiscussion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discussionData),
        });
        const result = await response.json();
        console.log('Discussion added:', result);
    } catch (error) {
        console.error('Error adding discussion in request:', error);
    }
};

const Home: React.FC<Props> = (props) => {
    const [showInput, setShowInput] = useState(false);
    const toggleInput = () => {
        setShowInput(prevState => !prevState);
    };

    const createDiscussion = async (title, content) => {
        await addDiscussion({title: title, content: content, authorId: "1"})

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
