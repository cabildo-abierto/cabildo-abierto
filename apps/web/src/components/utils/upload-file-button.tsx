import {ReactNode, useRef} from "react";
import {
    CloudArrowUpIcon
} from "@phosphor-icons/react";
import {BaseButton, BaseButtonProps} from "@/components/utils/base/base-button";

export const UploadFileButton = ({children, onUpload, multiple = false, size}: {
    children: ReactNode,
    onUpload: (_: FileList) => void,
    multiple?: boolean
    size?: BaseButtonProps["size"]
}) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    return <BaseButton
        onClick={handleButtonClick}
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudArrowUpIcon/>}
        size={size}
    >
        {children}
        <input
            ref={inputRef}
            className={"hidden"}
            type={"file"}
            onChange={(e) => {
                onUpload(e.target.files)
            }}
            multiple={multiple}
        />
    </BaseButton>
}