"use client"

import React, { useState } from "react";
import { createPost, createDiscussion } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import MyEditor, { emptyInitialValue } from "@/components/editor/editor"


const Escribir: React.FC = () => {
  const [content, setContent] = useState(emptyInitialValue);
  const router = useRouter();

  const handleCreate = async () => {
    const success = await createPost(content)
    if (success) {
      router.push("/")
    }
  }

  const isEmpty = (value) => {
      return value.length == 1 && value[0].children.length == 1 && value[0].children[0].text.length == 0
  }

  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col w-full px-5 mt-8">
        <h1 className="text-2xl ml-2 py-8 font-semibold mb-8">
          Publicá lo que quieras
        </h1>
        <div className="">
          <MyEditor
            placeholder={""}
            onChange={setContent}
            minHeight="6em"
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

