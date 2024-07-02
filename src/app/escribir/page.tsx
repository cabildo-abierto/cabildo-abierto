"use client"

import React, { useState } from "react";
import { createPost } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";


const Editor = dynamic( () => import( '@/components/editor/editor' ), { ssr: false } );


const PostSelector = () => {
  const buttonClass = "focus:border-b-2 focus:border-blue-800 px-5"
  return <div className="border-b">
    <button className={buttonClass}>Publicación rápida</button>
    <button className={buttonClass}>Publicación</button>
  </div>
}


const Escribir: React.FC = () => {
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    const success = await createPost(JSON.stringify(content))
    if (success) {
      router.push("/")
    }
  }

  const isEmpty = (value) => {
      return value.length == 0
  }

  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col w-full px-5 mt-8">
        <PostSelector/>
        <div className="">
          <Editor
            onChange={setContent}
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleCreate}
            disabled={isEmpty(content)}
            className={`py-2 px-4 rounded font-bold transition duration-200 ${isEmpty(content) ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              }`}
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Escribir;

