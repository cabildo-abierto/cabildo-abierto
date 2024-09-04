"use client"

import { createPost } from 'src/actions/actions';
import { useUser } from 'src/app/hooks/user';
import { ThreeColumnsLayout } from "src/components/three-columns";
import { ContentType } from '@prisma/client';
import { useSWRConfig } from 'swr';
import PostEditor from 'src/components/editor/post-editor';


const Publicacion: React.FC = () => {

    return <ThreeColumnsLayout center={<PostEditor
        isFast={false}
    />}/>
}

export default Publicacion