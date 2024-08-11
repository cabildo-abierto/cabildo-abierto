"use client"

import { createPost } from '@/actions/create-content';
import { ThreeColumnsLayout } from '@/components/main-layout';
import { ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';

const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


const PublicacionRapida: React.FC = () => {
    return <ThreeColumnsLayout center={<FastEditor
        onSubmit={async (text: string, type: ContentType) => {await createPost(text, type, false)}}
        onSaveDraft={async (text: string, type: ContentType) => {await createPost(text, type, true)}}
    />}/>
}

export default PublicacionRapida