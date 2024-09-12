"use client"

import PostEditor from "../../../components/editor/post-editor"
import { ThreeColumnsLayout } from "../../../components/three-columns"



const Publicacion: React.FC = () => {

    return <ThreeColumnsLayout center={<PostEditor
        isFast={false}
    />}/>
}

export default Publicacion