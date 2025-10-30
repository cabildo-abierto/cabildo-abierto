import { Spinner } from "@/components/ui/spinner"
import {cn} from "@/lib/utils";


const LoadingSpinner = ({className}: { className?: string }) => {
    return <div className="flex items-center justify-center h-full w-full text-[var(--text-light)]">
        <div>
            <Spinner className={cn("w-6 h-6 text-[var(--text-light)]", className)}/>
        </div>
    </div>
}


export default LoadingSpinner;
