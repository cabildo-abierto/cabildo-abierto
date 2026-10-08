import {Spinner} from "@/components/ui/spinner";
import {cn} from '@/lib/utils';

export function TopicLoading() {
    return <div className={cn('flex items-center flex-col gap-7 justify-center h-screen fixed top-0 left-1/2 -translate-x-1/2 p-6 text-sm text-muted-foreground')}>
        <Spinner className={cn('size-7')}/>
    </div>;
}
