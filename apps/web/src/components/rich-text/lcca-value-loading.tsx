import {cn} from "@/lib/utils";
import {MatrixRain} from '@/components/ui/matrix-rain';

export function LccaValueLoading({effect = "matrix"}: {effect?: "matrix" | "reflection"} = {}) {
    return <span role="status">
        <span aria-hidden="true" className={cn("relative inline-block w-[3ch] rounded bg-primary/10")}>
            {"\u00a0"}
            {effect === "reflection" ? <span className={cn("lcca-value-loading absolute inset-0 overflow-hidden rounded")}/>
                : <MatrixRain/>}
        </span>
        <span className={cn("sr-only")}>Cargando valor…</span>
    </span>;
}
