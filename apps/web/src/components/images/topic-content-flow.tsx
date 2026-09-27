"use client";
import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {cn} from '@/lib/utils';
export function TopicContentFlow({children,className}: {children:ReactNode;className?:string}) {
    const ref=useRef<HTMLDivElement>(null);
    const [width,setWidth]=useState(0);
    useEffect(()=>{
        const element=ref.current;if(!element)return;
        const observer=new ResizeObserver(entries=>setWidth(entries[0]?.contentRect.width??0));observer.observe(element);
        return()=>observer.disconnect();
    },[]);
    return <div ref={ref} data-topic-flow style={{'--topic-flow-width':width+'px'} as CSSProperties} className={cn('flow-root min-w-0',className)}>{children}</div>;
}
