"use client";

import Link from "next/link";
import {ArrowLeftIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function BackToTopicButton({href, replace = false}: {href: string; replace?: boolean}) {
    return <Button nativeButton={false} render={<Link href={href} replace={replace}/>}
        variant="ghost" size="sm" className={cn("text-muted-foreground")}>
        <ArrowLeftIcon aria-hidden="true"/>Volver al tema
    </Button>;
}
