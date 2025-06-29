


export const PlotCaption = ({caption, fontSize = 14}: { caption?: string, fontSize?: number }) => {
    if (!caption) return null;

    return <div
        className="italic text-center text-[var(--text-light)] h-[20px] leading-[20px] mt-1 px-2 break-all"
        style={{fontSize}}
    >
        {caption}
    </div>
}

export const PlotTitle = ({title, fontSize = 18}: { title?: string, fontSize: number }) => {
    if (!title) return null;
    return <div
        className="text-center font-semibold text-lg h-[30px] pt-2 items-baseline flex justify-center"
        style={{fontSize: fontSize}}
    >
        {title}
    </div>
}