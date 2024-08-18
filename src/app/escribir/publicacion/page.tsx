"use client"

import { createPost } from '@/actions/create-content';
import { ThreeColumnsLayout } from "@/components/three-columns";
import { ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );


const Publicacion: React.FC = () => {
    return <ThreeColumnsLayout center={<PostEditor
        onSubmit={async (text: string, type: ContentType, title?: string) => {await createPost(text, type, false, undefined, title)}}
        onSaveDraft={async (text: string, type: ContentType, title?: string) => {await createPost(text, type, true, undefined, title)}}
    />}/>
}

export default Publicacion