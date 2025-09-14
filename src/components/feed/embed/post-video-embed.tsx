"use client";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { PrettyJSON } from "../../../../modules/ui-utils/src/pretty-json";
import Image from "next/image";
import {AppBskyEmbedVideo} from "@atproto/api"

type PostVideoEmbedProps = {
    embed: AppBskyEmbedVideo.View
}

export default function PostVideoEmbed({ embed }: PostVideoEmbedProps) {
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [retryCount, setRetryCount] = useState(0)

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
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            // Try to recover network errors (e.g., dropped connection)
                            console.log("Network error, retrying...");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            // Try to recover media errors (e.g., corrupt segment)
                            console.log("Media error, recovering...");
                            hls.recoverMediaError();
                            break;
                        default:
                            // Give up after 3 retries
                            if (retryCount < 3) {
                                setRetryCount(retryCount + 1)
                                setTimeout(() => hls.startLoad(), 1000 * retryCount); // Backoff retry
                            } else {
                                setError("No se pudo cargar el video");
                                hls.destroy();
                            }
                    }
                }
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
            style={{ aspectRatio: embed.aspectRatio ? `${embed.aspectRatio.width} / ${embed.aspectRatio.height}` : 0.75 }}
        >
            {!isReady && (
                <div className={"w-full flex justify-center"}>
                    <Image
                    src={embed.thumbnail}
                    alt="Video thumbnail"
                    className="w-[400px] h-[500px] object-cover rounded-lg"
                    width={embed.aspectRatio?.width ?? 400}
                    height={embed.aspectRatio?.height ?? 500}
                />
                </div>
            )}
            <video
                ref={videoRef}
                className={`rounded-lg w-full h-full object-contain transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
                controls
                playsInline
                poster={embed.thumbnail}
                width={embed.aspectRatio?.width ?? 400}
                height={embed.aspectRatio?.height ?? 500}
            >
                Tu navegador no soporta reproducción de videos.
            </video>
        </div>
    );
};
