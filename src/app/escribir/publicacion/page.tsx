"use client"

import { createPost } from 'src/actions/actions';
import { useUser } from 'src/app/hooks/user';
import { ThreeColumnsLayout } from "src/components/three-columns";
import { ContentType } from '@prisma/client';
import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

const PostEditor = dynamic( () => import( 'src/components/editor/post-editor' ), { ssr: false } );




const Publicacion: React.FC = () => {
    const {mutate} = useSWRConfig()
    const {user} = useUser()

    const onCreatePost = (isDraft: boolean) => async (text: string, type: ContentType, title?: string) => {
        if(user){
            await createPost(text, type, isDraft, user.id, title)
            mutate("/api/feed")
            mutate("/api/profile-feed/"+user.id)
            // Habría que mutar el following-feed de todos los que lo siguen, medio raro
        }
    }

    return <ThreeColumnsLayout center={<PostEditor
        onSubmit={onCreatePost(false)}
        onSaveDraft={onCreatePost(true)}
    />}/>
}

export default Publicacion