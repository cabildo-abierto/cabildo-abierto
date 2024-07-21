"use client"

import React, { useEffect, useRef, useState } from "react";
import { createPost } from '@/actions/create-content'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ThreeColumnsLayout } from "@/components/main-layout";
import Link from "next/link";
import { splitPost } from "@/components/utils";


const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );
const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


const PostSelector = ({setSelection}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
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


export function validPost(text){
    return splitPost(text) != null
}

export function validFastPost(text){
    console.log(text)
    return text.length > 0
}


const Escribir: React.FC = () => {
    const [selection, setSelection] = useState("publicación rápida");
    const router = useRouter();

    const handleCreate = async (text) => {
        const contentType = selection == "publicación" ? "Post" : "FastPost"
        if(contentType == "Post" && !validPost(text)) return
        if(contentType == "FastPost" && !validFastPost(text)) return
        const success = await createPost(text, contentType, false)
        if (success) {
            router.push("/")
        }
    }

    const handleSaveDraft = async (text) => {
        const contentType = selection == "publicación" ? "Post" : "FastPost"
        if(text.length == 0) return
        const success = await createPost(text, contentType, true)
        if (success) {
            router.push("/borradores")
        }
    }

    const center = <div className="flex justify-center h-screen">
        <div className="flex flex-col w-full px-5 mt-8">
                <Link href="/borradores" className="mb-4">
                    <button className="gray-button">Mis borradores</button>
                </Link>
                <PostSelector setSelection={setSelection}/>
                {selection == "publicación" ?
                    <PostEditor
                        onSubmit={handleCreate}
                        onSaveDraft={handleSaveDraft}
                    /> : 
                    <FastEditor
                        onSubmit={handleCreate}
                        onSaveDraft={handleSaveDraft}
                    />
                }
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
};

export default Escribir;

