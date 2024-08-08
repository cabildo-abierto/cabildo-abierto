"use client"

import StateButton from "./state-button"

export const PayButton: React.FC<any> = ({onClick}) => {
    return <StateButton
        onClick={onClick}
        className="large-btn scale-btn"
        text1={"Pagando..."}
        text2={"Pagar"}
    />
}

export default PayButton