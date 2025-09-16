export function configOptionNodes(o: string, selected: boolean) {
    return <button
        className={"text-xs uppercase py-[2px] hover:bg-[var(--background-dark)] px-2 cursor-pointer border-[1px] border-[var(--text-lighter)] " + (selected ? "bg-[var(--background-dark2)]" : "")}
        >
        {o}
        </button>
}