import {Spinner} from "@/components/ui/spinner";

export function TopicLoading() {
    return <div className="flex items-center flex-col gap-7 justify-center h-screen fixed top-0 left-1/2 -translate-x-1/2 p-6 text-sm text-muted-foreground">
        <Spinner className="size-7"/>
        Cargando tema...
    </div>;
}
