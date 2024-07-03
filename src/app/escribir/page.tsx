"use client"

import React, { useEffect, useRef, useState } from "react";
import { createPost } from '@/actions/create-comment'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";


const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


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
  const [selection, setSelection] = useState("publicación rápida");
  const router = useRouter();

  const handleCreate = async (content) => {
    const contentType = selection == "publicación" ? "Post" : "FastPost"
    const success = await createPost(content, contentType)
    if (success) {
      router.push("/")
    }
  }

  return (
    <div className="flex justify-center h-screen">
      <div className="flex flex-col w-full px-5 mt-8">
        <PostSelector setSelection={setSelection}/>
        {selection == "publicación" ?
          <PostEditor
            onSubmit={handleCreate}
          /> : 
          <FastEditor
            onSubmit={handleCreate}
          />
        }
      </div>
    </div>
  );
};

export default Escribir;

