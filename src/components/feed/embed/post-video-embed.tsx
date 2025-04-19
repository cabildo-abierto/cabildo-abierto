"use client"
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";
import {View as VideoEmbedView} from "@/lex-api/types/app/bsky/embed/video"
import {useState} from "react";


type PostVideoEmbedProps = {
    embed: VideoEmbedView
}

export const PostVideoEmbed = ({embed}: PostVideoEmbedProps) => {
    const [error, setError] = useState<string | null>(null);

    const handleError = () => {
        setError("Error al cargar el video");
    };

    if (error) {
        return <div className="w-full p-4 text-center text-[var(--text-light)] border rounded-lg">
            {error}
            <PrettyJSON data={embed}/>
        </div>;
    }

    return <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation()
        }}
        className="mt-2"
    >
        {/* TO DO: Hacer que esto ande */}
        <video
            src={embed.playlist[0]}
            className="rounded-lg w-full h-auto max-h-[500px]"
            controls
            playsInline
            onError={handleError}
        >
            Tu navegador no soporta reproducción de videos.
        </video>
        {/*

            <Image
                src={embed.thumbnail}
                width={300}
                height={300}
                alt="video"
                className="w-full h-auto max-h-[515px] rounded-lg border"
            />

        */}
    </div>
}