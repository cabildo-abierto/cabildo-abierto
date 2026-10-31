import type {Metadata} from 'next';
import {ApiReference} from '@/components/api-reference/api-reference';

export const metadata: Metadata = {
    title: 'API | Cabildo Abierto',
    description: 'Referencia de la API de Cabildo Abierto: endpoints, parámetros y respuestas.',
};

export default function ApiPage() {
    return <ApiReference/>;
}
