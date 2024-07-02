"use client"

import React, { useEffect, useRef, useState } from "react";
import { createPost } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import FastEditor from "@/components/editor/fast-editor";


const Editor = dynamic( () => import( '@/components/editor/editor' ), { ssr: false } );


const PostSelector = ({setSelection}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Focus the button when the component mounts
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, []);

  const buttonClass = "focus:border-b-2 focus:border-blue-800 px-5 focus:outline-none"
  return <div className="border-b">
    <button ref={buttonRef} className={buttonClass} onClick={() => {setSelection("publicación rápida")}}>Publicación rápida</button>
    <button className={buttonClass} onClick={() => {setSelection("publicación")}}>Publicación</button>
  </div>
}


const Escribir: React.FC = () => {
  const [content, setContent] = useState("");
  const [selection, setSelection] = useState("publicación rápida");
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
        <PostSelector setSelection={setSelection}/>
        {selection == "publicación" ?
          <Editor
            onChange={setContent}
          /> : 
          <FastEditor
            onChange={setContent}
          />
        }
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

