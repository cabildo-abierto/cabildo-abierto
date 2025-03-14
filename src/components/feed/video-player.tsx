"use client"
import { useRef, useState } from 'react';


export const VideoPlayer = ({videoUrl}: {videoUrl: string}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    const handleError = () => {
        setError("Error al cargar el video");
    };

    if (error) {
        return <div className="w-full p-4 text-center text-[var(--text-light)] border rounded-lg">
            {error}
        </div>;
    }

    return <div className="w-full">
        <video
            ref={videoRef}
            src={videoUrl}
            className="rounded-lg w-full h-auto"
            controls
            playsInline
            onError={handleError}
        >
            Tu navegador no soporta reproducción de videos.
        </video>
    </div>
}