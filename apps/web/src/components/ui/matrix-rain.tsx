import {cn} from '@/lib/utils';

const streams = ['01:10+', '10/01=', '0+1:01'];

export function MatrixRain() {
    return <span aria-hidden="true" className={cn('absolute inset-0 grid grid-cols-3 overflow-hidden rounded text-inherit')}>
        {streams.map((stream, column) => {
            return <span key={column} className={cn('lcca-value-matrix-stream flex self-start flex-col text-center font-mono text-[9px] leading-[1em] motion-reduce:animate-none')}
                style={{animationDuration: `${1.2 + column * 0.3}s`, animationDelay: `${-column * 0.4 - 0.3}s`}}>
                {(stream + stream).split('').map((character, index) => <span key={index}
                    className={cn('block shrink-0', index % stream.length === stream.length - 1 ? 'opacity-100' : index % 3 === 0 ? 'opacity-70' : 'opacity-30')}>{character}</span>)}
            </span>;
        })}
    </span>;
}
