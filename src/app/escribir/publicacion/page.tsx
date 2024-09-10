"use client"

import { ThreeColumnsLayout } from "src/components/three-columns";
import PostEditor from 'src/components/editor/post-editor';


const Publicacion: React.FC = () => {

    return <ThreeColumnsLayout center={<PostEditor
        isFast={false}
    />}/>
}

export default Publicacion