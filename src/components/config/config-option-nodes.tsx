export function configOptionNodes(o: string, selected: boolean) {
    return <button
        className={"text-xs uppercase py-[2px] hover:bg-[var(--background-dark2)] px-2 cursor-pointer border-[1px] border-[var(--accent-dark)] " + (selected ? "bg-[var(--background-dark3)]" : "")}
        >
        {o}
        </button>
}