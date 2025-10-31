import {ReactNode, useRef} from "react";
import {BaseButton} from "@/components/layout/base/baseButton";
import {
    CloudArrowUpIcon
} from "@phosphor-icons/react";

export const UploadFileButton = ({children, onUpload, multiple = false}: {
    children: ReactNode,
    onUpload: (_: FileList) => void,
    multiple?: boolean
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