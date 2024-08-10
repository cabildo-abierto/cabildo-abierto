"use client"

import React from "react";
import { createPost } from '@/actions/create-content'
import { useRouter } from "next/navigation";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { validFastPost, validPost } from "@/components/utils";


import dynamic from "next/dynamic";

const PostEditorLexical = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );



const Escribir: React.FC<{fast: boolean}> = ({fast}) => {
    const router = useRouter()
    const contentType = fast ? "FastPost" : "Post"

    const handleCreate = async (text: string) => {
        if(contentType == "Post" && !validPost(text)) return
        if(contentType == "FastPost" && !validFastPost(text)) return
        const success = await createPost(text, contentType, false)
        if (!success) {
            console.log("Error al publicar post :(")
        } else {
            // TO DO: Invalidate cache
            router.push("/")
        }
    }

    const handleSaveDraft = async (text: string) => {
        if(text.length == 0) return
        const success = await createPost(text, contentType, true)
        if (success) {
            router.push("/borradores")
        }
    }

    const center = <>
        {fast ? <PostEditorLexical
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
        />: 
        <PostEditorLexical
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
        />
        }
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Escribir

