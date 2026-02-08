import {cn} from "@/lib/utils";

export const PollChoice = ({label, voted, votes, disabled = false, totalVotes, onSelect}: {
    label: string
    votes: number
    totalVotes: number
    voted: boolean
    onSelect: () => void
    disabled?: boolean
}) => {
    const pct = totalVotes == 0 ? 0 : Math.round((votes / totalVotes) * 100)

    return <button
        onClick={onSelect}
        disabled={disabled}
        className={cn("rounded-xl border p-3 space-y-2", voted ? "border-[var(--text)]" : "", disabled ? "opacity-50" : "hover:bg-[var(--background-dark2)]")}
    >
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <span className="font-medium">
                    {label}
                </span>

                {voted && <span className="text-xs rounded-full bg-[var(--accent)] px-2 py-0.5">
                    tu voto
                </span>}
            </div>

            <span className="text-[var(--text-light)]">
                {pct}% <span className="">({votes})</span>
            </span>
        </div>

        <div className="h-2 w-full rounded-full relative bg-[var(--text)] overflow-hidden">
            <div
                className="h-full rounded-full absolute bg-[var(--primary)] transition-all"
                style={{width: `${pct}%`}}
            />
        </div>
    </button>
}