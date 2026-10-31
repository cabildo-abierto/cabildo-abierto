import {HomeSearch} from "@/components/search/home-search";
import {HomeFooter} from '@/components/home-footer';
import {cn} from '@/lib/utils';

export default function Page() {
    return <div className={cn('flex min-h-[calc(100vh-3rem)] flex-col')}>
        <HomeSearch/>
        <HomeFooter/>
    </div>;
}
