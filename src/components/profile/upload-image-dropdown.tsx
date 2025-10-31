import {ReactNode, useCallback, useRef, useState} from "react";
import {useLoadImage} from "@/components/writing/write-panel/upload-image-button";
import EditImageModal from "@/components/profile/edit-image-modal";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import UploadFileIcon from "@/components/layout/icons/upload-file-icon";


export const UploadImageDropdown = ({
                                        children,
                                        setImage,
                                        crop
                                    }: {
    children: ReactNode
    setImage: (i: any) => void
    crop: "circle" | "rectangle" | "none"
}) => {
    const [editingImage, setEditingImage] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const onSubmit = useCallback((i: any) => {
        if (crop !== "none") {
            setEditingImage(i)
        } else {
            setImage(i)
        }
    }, [crop, setImage])

    const loadImage = useLoadImage(onSubmit);

    const handleMenuItemSelect = (e: Event) => {
        e.preventDefault()
        fileInputRef.current?.click()
    }

    return (
        <>
            {crop !== "none" && editingImage && <EditImageModal
                editingImage={editingImage}
                onClose={() => {
                    setEditingImage(null);
                }}
                setImage={setImage}
                crop={crop}
            />}

            <DropdownMenu>
                <DropdownMenuTrigger>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent className={"z-[1500]"}>
                    <DropdownMenuItem
                        tabIndex={-1}
                        onSelect={handleMenuItemSelect as any}
                    >
                        <div>
                            <UploadFileIcon fontSize={18} weight={"light"}/>
                        </div>
                        <div>
                            Subir imagen
                        </div>
                        <input
                            className={"hidden"}
                            ref={fileInputRef}
                            type={"file"}
                            accept={"image/*"}
                            onChange={loadImage}
                            multiple={false}
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}