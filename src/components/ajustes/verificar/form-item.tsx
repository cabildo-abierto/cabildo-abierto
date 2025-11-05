import {ReactNode} from "react";
import {FileIcon, TrashIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";

export type FormItemProps = {
    label: ReactNode,
    contentBelow?: ReactNode,
    children: ReactNode,
    below?: boolean
}


export const FormItem = ({label, children, below = false, contentBelow}: FormItemProps) => {

    return <div className={"border-[var(--accent-dark)] space-y-4"}>
        <div
            className={below ? " space-y-4" : " flex justify-between items-center"}>
            <div className={"sm:text-base text-sm font-light"}>
                {label}
            </div>
            <div>
                {children}
            </div>
        </div>
        {contentBelow}
    </div>
}


export const FormItemWithFiles = ({fileNames, onRemove, ...props}: Omit<FormItemProps, "fileNames"> & {
    fileNames: string[],
    onRemove: (_: number) => void
}) => {
    const contentBelow = fileNames && fileNames.length > 0 ? <div
        className={"flex space-y-2 flex-col"}
    >
        {fileNames.map((fileName, i) => {
            return <div
                key={i}
                className={"flex justify-between items-center space-x-2 border border-[var(--accent-dark)] p-2"}
            >
                <div className={"flex items-center space-x-2"}>
                    <FileIcon/>
                    <div>
                        {fileName}
                    </div>
                </div>
                <BaseIconButton
                    onClick={() => {
                        onRemove(i)
                    }}
                    size={"small"}
                >
                    <TrashIcon/>
                </BaseIconButton>
            </div>
        })}
    </div> : undefined

    return <FormItem
        {...props}
        contentBelow={contentBelow}
    />
}


