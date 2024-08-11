"use client"

import { createPost } from '@/actions/create-content';
import { ThreeColumnsLayout } from '@/components/main-layout';
import { ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );


const Publicacion: React.FC = () => {
    return <ThreeColumnsLayout center={<PostEditor
        onSubmit={async (text: string, type: ContentType) => {await createPost(text, type, false)}}
        onSaveDraft={async (text: string, type: ContentType) => {await createPost(text, type, true)}}
    />}/>
}

export default Publicacion