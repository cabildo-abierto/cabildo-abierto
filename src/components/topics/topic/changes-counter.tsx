type CharsCounterProps = { charsAdded: number, charsDeleted: number }


export const ChangesCounter = ({charsAdded, charsDeleted}: CharsCounterProps) => {
    if(charsAdded == null || charsDeleted == null) return null

    return <>
        <span className="text-red-600">-{charsDeleted}</span> <span
        className="text-green-600">+{charsAdded}</span>
    </>
}


export const ChangesCounterWithText = ({charsAdded, charsDeleted}: CharsCounterProps) => {
    if(charsAdded == null || charsDeleted == null) return null

    return <div>
        Estás agregando <span
        className="text-green-600">{charsAdded}</span> {charsAdded == 1 ? "caracter" : "caracteres"} y eliminando <span
        className="text-red-600">{charsDeleted}</span> {charsDeleted == 1 ? "caracter" : "caracteres"}.
    </div>
}