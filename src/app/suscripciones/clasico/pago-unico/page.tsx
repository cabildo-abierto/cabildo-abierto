import { BuyClassicPlanButton } from "../../../../components/buy-classic-plan-button"
import { ThreeColumnsLayout } from "../../../../components/three-columns"
import { getSubscriptionPrice } from "../../../../components/utils"


export default function PlanClasicoPagoUnico() {
    const price = getSubscriptionPrice()

    const center = <>
        <div className="flex justify-center mt-16">Acá ingresarías tu método de pago si lo hubiéramos implementado.</div>
        <div className="flex justify-center mt-8">Total: ${price}</div>
        <div className="flex justify-center mt-8">Tocá el botón, es gratis, todavía no abrimos.</div>
        <div className="flex justify-center mt-8">
        <BuyClassicPlanButton/>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}