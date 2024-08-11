import { ThreeColumnsLayout } from '@/components/main-layout';
import dynamic from 'next/dynamic';

const PostEditor = dynamic( () => import( '@/components/editor/post-editor' ), { ssr: false } );


const Publicacion: React.FC = () => {
    return <ThreeColumnsLayout center={<PostEditor/>}/>
}

export default Publicacion