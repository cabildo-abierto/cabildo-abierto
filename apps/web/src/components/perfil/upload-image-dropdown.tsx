import {ReactNode, useCallback, useRef, useState} from "react";
import {useLoadImage} from "../writing/write-panel/upload-image-button";
import EditImageModal from "./edit-image-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/utils/ui/dropdown-menu";
import UploadFileIcon from "@/components/utils/icons/upload-file-icon";
import {TrashIcon} from "@phosphor-icons/react";


export const UploadImageDropdown = ({
                                        children,
                                        setImage,
                                        crop,
                                        onDelete
                                    }: {
    children: ReactNode
    setImage: (i: any) => void
    crop: "circle" | "rectangle" | "none"
    onDelete?: () => void
}) => {
    const [editingImage, setEditingImage] = useState<any | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

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

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent className={"z-[1500]"}>
                    <DropdownMenuItem
                        tabIndex={-1}
                        onSelect={(e) => {handleMenuItemSelect(e);}}
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
                            onChange={async (e) => {
                                await loadImage(e)
                                setDropdownOpen(false)
                            }}
                            multiple={false}
                        />
                    </DropdownMenuItem>
                    {onDelete && (
                        <DropdownMenuItem
                            tabIndex={-1}
                            onSelect={(e) => {
                                e.preventDefault()
                                onDelete()
                                setDropdownOpen(false)
                            }}
                        >
                            <div>
                                <TrashIcon fontSize={18} weight={"light"}/>
                            </div>
                            <div>
                                Eliminar imagen
                            </div>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}