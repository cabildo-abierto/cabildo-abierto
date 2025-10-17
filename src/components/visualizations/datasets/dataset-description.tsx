import dynamic from "next/dynamic";
const ReadOnlyEditor = dynamic(() => import('@/components/writing/read-only-editor'), {
    ssr: false,
    loading: () => <></>,
});


export const DatasetDescription = ({description}: {description: string}) => {
    if(!description || description.length == 0) return "Sin descripción."
    return <div className={"text-[var(--text)]"}>
        <ReadOnlyEditor text={description} format={"markdown"}/>
    </div>
}