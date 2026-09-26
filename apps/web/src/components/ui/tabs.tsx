"use client";
import {Tabs as TabsPrimitive} from '@base-ui/react/tabs';
import {cn} from '@/lib/utils';

const Tabs = TabsPrimitive.Root;
function TabsList({className, ...props}: TabsPrimitive.List.Props) {
    return <TabsPrimitive.List className={cn('inline-flex items-center gap-1 rounded-md bg-muted p-1',className)} {...props}/>;
}
function TabsTrigger({className, ...props}: TabsPrimitive.Tab.Props) {
    return <TabsPrimitive.Tab className={cn('rounded-sm px-2 py-1 text-xs font-medium text-muted-foreground outline-none data-active:bg-background data-active:text-foreground data-active:shadow-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',className)} {...props}/>;
}
function TabsContent({className, ...props}: TabsPrimitive.Panel.Props) {
    return <TabsPrimitive.Panel className={cn('min-w-0 outline-none',className)} {...props}/>;
}
export {Tabs, TabsList, TabsTrigger, TabsContent};
