
type CharsCounterProps = {charsAdded: number, charsDeleted: number}


export const ChangesCounter = ({charsAdded, charsDeleted}: CharsCounterProps) => {
    
    return <><span className="text-red-600">-{charsDeleted != null ? charsDeleted : "?"}</span> <span className="text-green-600">+{charsAdded != null ? charsAdded : "?"}</span></>
}


export const ChangesCounterWithText = ({charsAdded, charsDeleted}: CharsCounterProps) => {
    return <div>
        Estás agregando <span className="text-green-600">{charsAdded != null ? charsAdded : "?"}</span> {charsAdded == 1 ? "caracter" : "caracteres"} y eliminando <span className="text-red-600">{charsDeleted != null ? charsDeleted : "?"}</span> {charsDeleted == 1 ? "caracter" : "caracteres"}.
    </div>
}