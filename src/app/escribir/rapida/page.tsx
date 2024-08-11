import { ThreeColumnsLayout } from '@/components/main-layout';
import dynamic from 'next/dynamic';

const FastEditor = dynamic( () => import( '@/components/editor/fast-editor' ), { ssr: false } );


const PublicacionRapida: React.FC = () => {
    return <ThreeColumnsLayout center={<FastEditor/>}/>
}

export default PublicacionRapida