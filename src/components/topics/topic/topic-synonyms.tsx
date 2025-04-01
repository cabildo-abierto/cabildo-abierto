

export const TopicSynonyms = ({
                                    synonyms,
                                    maxCount,
                                    containerClassName="text-xs",
                                    className="px-2 bg-[var(--background-dark2)] text-[var(--text-light)] rounded-lg"
                                }: {
    synonyms: string[]
    className?: string
    maxCount?: number
    containerClassName?: string
}) => {
    return <div className={"flex gap-x-2 flex-wrap items-center gap-y-2 " + containerClassName}>
        {synonyms.slice(0, maxCount != null ? maxCount : synonyms.length).map((c, index) => {
            return <div key={index} className={className}>
                {c}
            </div>
        })}
    </div>
}