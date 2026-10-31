import Link from 'next/link';
import {cn} from '@/lib/utils';

export function HomeFooter() {
    return <footer className={cn('w-full px-4 pb-5 sm:px-6')}>
        <nav aria-label="Enlaces de inicio" className={cn('flex justify-end pt-4')}>
            <Link href="/api" className={cn('rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4')}>
                API
            </Link>
        </nav>
    </footer>;
}
