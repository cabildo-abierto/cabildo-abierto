"use client";

import {useState, useCallback} from "react";
import Cropper from "react-easy-crop";
import {BaseFullscreenPopup} from "../layout/base/base-fullscreen-popup";
import {BaseButton} from "../layout/base/baseButton";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {Slider} from "@/components/ui/slider";

const getCroppedImg = (
    imageSrc: string,
    crop: { x: number; y: number; width: number; height: number },
    cropShape: "circle" | "rectangle",
    targetSize = 512,
    quality = 0.85
): Promise<ImagePayload> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("No canvas context");

            const scale = targetSize / Math.max(crop.width, crop.height);
            const outWidth = Math.round(crop.width * scale);
            const outHeight = Math.round(crop.height * scale);

            canvas.width = outWidth;
            canvas.height = outHeight;

            if (cropShape === "circle") {
                ctx.beginPath();
                ctx.arc(outWidth / 2, outHeight / 2, outWidth / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
            }

            ctx.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                outWidth,
                outHeight
            )

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Canvas is empty");
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        resolve({
                            $type: "file",
                            base64,
                            src: URL.createObjectURL(blob),
                        })
                    }
                },
                "image/jpeg",
                quality
            );
        };

        image.onerror = (e) => reject(e);
    });
};


const EditImageModal = ({
                            editingImage,
                            setImage,
                            onClose,
                            crop,
                        }: {
    setImage: (i: ImagePayload) => void;
    onClose: () => void;
    crop: "circle" | "rectangle";
    editingImage: ImagePayload;
}) => {
    const [cropPos, setCropPos] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = useCallback(async () => {
        if (!croppedAreaPixels) return;
        try {
            const newImg = await getCroppedImg(editingImage.src, croppedAreaPixels, crop);
            setImage(newImg);
            onClose();
        } catch (e) {
            console.error("Error cropping image", e);
        }
    }, [croppedAreaPixels, editingImage, crop, setImage, onClose]);

    return (
        <BaseFullscreenPopup
            onClose={onClose}
            closeButton={true}
            open={true}
            className={"z-[1600]"}
        >
            <div className="flex flex-col px-4 w-[400px]">
                <h3 className="text-base uppercase font-bold mb-4">Recortar imagen</h3>

                <div className="relative h-[400px]">
                    <Cropper
                        image={editingImage.src}
                        crop={cropPos}
                        zoom={zoom}
                        aspect={crop == "circle" ? 1 : 3}
                        cropShape={crop === "circle" ? "round" : "rect"}
                        showGrid={false}
                        onCropChange={setCropPos}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <div className="pb-4 pt-8 flex flex-col space-y-8 items-center">
                    <div className={"w-full px-8 space-y-[6px]"}>
                        <div className={"text-center text-xs text-[var(--text-light)]"}>
                            Zoom
                        </div>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(v) => setZoom(v[0])}
                            className={"w-full"}
                        />
                    </div>
                    <div className="flex gap-2 justify-end w-full">
                        <BaseButton onClick={onClose} size={"small"} variant={"outlined"}>
                            Cancelar
                        </BaseButton>
                        <BaseButton onClick={handleSave} variant={"outlined"} size={"small"}>
                            Guardar
                        </BaseButton>
                    </div>
                </div>
            </div>
        </BaseFullscreenPopup>
    );
};

export default EditImageModal;