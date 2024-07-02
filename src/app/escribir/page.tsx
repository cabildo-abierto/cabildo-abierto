"use client"

import React, { useState } from "react";
import { createPost } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";


const Editor = dynamic( () => import( '@/components/editor/editor' ), { ssr: false } );


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
        <h1 className="text-2xl ml-2 py-8 font-semibold">
          Publicá lo que quieras
        </h1>
        <div className="">
          <Editor
            onChange={setContent}
          />
        </div>
        <div className="flex justify-between mt-3">
          <button onClick={() => router.push("/feed")}
            className="bg-gray-200 hover:bg-gray-300 transition duration-200 font-bold py-2 px-4 rounded">
            Volver
          </button>
          <button
            onClick={handleCreate}
            disabled={isEmpty(content)}
            className={`py-2 px-4 rounded font-bold transition duration-200 ${isEmpty(content) ? "bg-gray-200 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              }`}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Escribir;

