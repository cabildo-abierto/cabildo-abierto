

const PayButton: React.FC<any> = ({onClick, paying=false}) => {
    return <button 
        className="large-btn scale-btn"
        onClick={onClick}
        disabled={paying}
    >
        {paying ? "Pagando..." : "Pagar"}
    </button>
}

export default PayButton