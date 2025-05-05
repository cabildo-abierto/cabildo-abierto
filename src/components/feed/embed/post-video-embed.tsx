"use client";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { PrettyJSON } from "../../../../modules/ui-utils/src/pretty-json";
import { View as VideoEmbedView } from "@/lex-api/types/app/bsky/embed/video";
import Image from "next/image";

type PostVideoEmbedProps = {
    embed: VideoEmbedView;
};

export const PostVideoEmbed = ({ embed }: PostVideoEmbedProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleCanPlay = () => {
            setIsReady(true);
        };

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(embed.playlist);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, handleCanPlay);
            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error("HLS error", data);
                setError("Error al cargar el video");
            });

            return () => {
                hls.off(Hls.Events.MANIFEST_PARSED, handleCanPlay);
                hls.destroy();
            };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = embed.playlist;
            video.addEventListener("loadedmetadata", handleCanPlay);
            return () => {
                video.removeEventListener("loadedmetadata", handleCanPlay);
            };
        } else {
            setError("Tu navegador no soporta este tipo de video.");
        }
    }, [embed.playlist]);

    if (error) {
        return (
            <div className="w-full p-4 text-center text-[var(--text-light)] border rounded-lg">
                {error}
                <PrettyJSON data={embed} />
            </div>
        );
    }

    return (
        <div
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            className="mt-2 relative w-full max-h-[500px]"
            style={{ aspectRatio: `${embed.aspectRatio.width} / ${embed.aspectRatio.height}` }}
        >
            {!isReady && (
                <Image
                    src={embed.thumbnail}
                    alt="Video thumbnail"
                    className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    width={embed.aspectRatio.width}
                    height={embed.aspectRatio.height}
                />
            )}
            <video
                ref={videoRef}
                className={`rounded-lg w-full h-full object-contain transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
                controls
                playsInline
                poster={embed.thumbnail}
                width={embed.aspectRatio.width}
                height={embed.aspectRatio.height}
            >
                Tu navegador no soporta reproducción de videos.
            </video>
        </div>
    );
};
