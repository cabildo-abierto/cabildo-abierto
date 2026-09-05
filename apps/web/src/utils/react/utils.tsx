import {cn} from "@/lib/utils";


export const ErrorMsg = ({text, className}: { text: string, className?: string }) => {
    return <div className={cn("text-red-600 text-sm", className)}>
        {text}
    </div>
}


export const emptyChar = <>&nbsp;</>