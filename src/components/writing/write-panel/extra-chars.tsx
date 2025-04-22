


export const ExtraChars = ({count, charLimit}: {count: number, charLimit: number}) => {
    return <>{charLimit-count < 100 && charLimit-count >= 0 && <div 
        className={"flex justify-end text-sm mt-2 text-[var(--text-light)]"}
    >
        Caracteres restantes: {charLimit-count}
    </div>}
    {charLimit && charLimit-count < 0 && <div
        className={"flex justify-end text-sm mt-2 text-red-600"}
    >
        Caracteres de más: {count-charLimit}
    </div>}
    </>
}