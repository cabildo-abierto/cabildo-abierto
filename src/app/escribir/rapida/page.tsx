"use client"

import { createPost } from 'src/actions/actions';
import { useUser } from 'src/app/hooks/user';
import { ThreeColumnsLayout } from "src/components/three-columns";
import { ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

const FastEditor = dynamic( () => import( 'src/components/editor/fast-editor' ), { ssr: false } );


const PublicacionRapida: React.FC = () => {
    const {mutate} = useSWRConfig()
    const {user} = useUser()
    
    const onCreatePost = (isDraft: boolean) => async (text: string, type: ContentType) => {
        if(user){
            await createPost(text, type, isDraft, user.id)
            await mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            // Habría que mutar el following-feed de todos los que lo siguen, medio raro
        }
    }

    return <ThreeColumnsLayout center={<FastEditor
        onSubmit={onCreatePost(false)}
        onSaveDraft={onCreatePost(true)}
    />}/>
}

export default PublicacionRapida