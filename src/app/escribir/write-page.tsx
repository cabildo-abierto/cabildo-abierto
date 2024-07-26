"use client"

import React, { useEffect, useRef, useState } from "react";
import { createPost } from '@/actions/create-content'
import { useRouter } from "next/navigation";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { validFastPost, validPost } from "@/components/utils";
import { useUser } from "@/components/user-provider";
import { useContents } from "@/components/use-contents";
import { updateContents } from "@/components/update-context";


import dynamic from "next/dynamic";

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );

const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


const Escribir: React.FC<{fast: boolean}> = ({fast}) => {
    const {contents, setContents} = useContents()
    const {user, setUser} = useUser()
    const router = useRouter()
    
    const contentType = fast ? "FastPost" : "Post"

    const handleCreate = async (text: string) => {
        if(!user) return
        if(contentType == "Post" && !validPost(text)) return
        if(contentType == "FastPost" && !validFastPost(text)) return
        router.push("/")
        const success = await createPost(text, contentType, false, user.id)
        if (!success) {
            console.log("Error al publicar post :(")
        } else {
            await updateContents(setContents)
        }
    }

    const handleSaveDraft = async (text: string) => {
        if(!user) return
        if(text.length == 0) return
        const success = await createPost(text, contentType, true, user.id)
        if (success) {
            router.push("/borradores")
        }
    }

    const center = <>
        {fast ? <FastEditor
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
        />: 
        <PostEditor
            onSubmit={handleCreate}
            onSaveDraft={handleSaveDraft}
        />
        }
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Escribir

