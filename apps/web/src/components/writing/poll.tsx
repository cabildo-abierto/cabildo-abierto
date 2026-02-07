import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {useState} from "react";

export const Poll = ({poll}: {
    poll: ArCabildoabiertoEmbedPoll.Main
}) => {

    const choices = poll.choices
    const [hasVoted, setHasVoted] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    async function onSelectOption(idx: number) {
        setSelectedIndex(idx)

        await post("/vote-poll/", {
            pollId: poll.id,
            choiceIndex: idx
        })

        setHasVoted(true)
    }

    const votesNum = (v: unknown) => {
        const n = Number(v)
        return Number.isFinite(n) ? n : 0
    }

    const totalVotes = choices.reduce((acc, c) => acc + votesNum(c.votes), 0)

    {choices.map((option, idx) => {
        const label = option.label?.trim() || `Opción ${idx + 1}`
        return <button key={`${poll.id}-${idx}`}>{label}</button>
    })}

    return (
        <div className="w-full max-w-md rounded-2xl border bg-white p-4 shadow-sm space-y-4">
            <div className="space-y-1">
                <div className="text-base font-semibold text-gray-900">
                    {poll.description}
                </div>
                <div className="text-xs text-gray-500">
                    Total votos: {totalVotes}
                </div>
            </div>

            {!hasVoted ? (
                <div className="flex flex-col gap-2">
                    {choices.map((option, idx) => {
                        const displayLabel =
                            option.label && option.label.trim().length > 0
                                ? option.label
                                : `Opción ${idx + 1}`

                        return (
                            <button
                                key={`${poll.id}-${idx}`}
                                onClick={() => {
                                    setSelectedIndex(idx)
                                    onSelectOption(idx)
                                    setHasVoted(true)
                                }}
                                className="rounded-xl border px-3 py-2 text-left hover:bg-gray-50 active:scale-[0.99]"
                            >
              <span className="text-sm font-medium text-gray-900">
                {displayLabel}
              </span>
                            </button>
                        )
                    })}
                </div>
            ) : (
                <div className="space-y-3">
                    {choices.map((option, idx) => {
                        const v = votesNum(option.votes)
                        const pct =
                            totalVotes === 0
                                ? 0
                                : Math.round((v / totalVotes) * 100)

                        const isMine = selectedIndex === idx

                        const displayLabel =
                            option.label && option.label.trim().length > 0
                                ? option.label
                                : `Opción ${idx + 1}`

                        return (
                            <div
                                key={`${poll.id}-${idx}`}
                                className={`rounded-xl border p-3 space-y-2 ${
                                    isMine ? "border-gray-900" : ""
                                }`}
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {displayLabel}
                  </span>

                                        {isMine && (
                                            <span className="text-xs rounded-full bg-gray-900 text-white px-2 py-0.5">
                      tu voto
                    </span>
                                        )}
                                    </div>

                                    <span className="text-gray-700">
                  {pct}% <span className="text-gray-500">({v})</span>
                </span>
                                </div>

                                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gray-900 transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )




}