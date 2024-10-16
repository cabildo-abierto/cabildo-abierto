"use client"

import StateButton from "./state-button"

export const PayButton: React.FC<any> = ({onClick}) => {
    return <StateButton
        handleClick={onClick}
        className="gray-btn"
        text1={"Pagar"}
        text2={"Pagando..."}
    />
}

export default PayButton