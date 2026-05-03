import {setupAppContext} from "#/setup.js";
import {MercadoPagoConfig, Payment} from "mercadopago";


async function getDNI() {

    const paymentId = "145056023577"

    const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
        options: { timeout: 5000 },
    })

    const payment = new Payment(client)
    const res = await payment.get({id: paymentId})

    let dni: number | undefined = undefined
    const id = res.payer?.identification
    if(id) {
        if(id.type == "CUIT" || id.type == "CUIL"){
            try {
                console.log("id", id)
                const dniStr = id.number?.slice(1, id.number.length-2)
                if(!dniStr) {
                    return {error: "Ocurrió un error al procesar el CUIT."}
                }
                dni = parseInt(dniStr)
            } catch {
                return {error: "Ocurrió un error al procesar el CUIT."}
            }
        } else {
            return {error: `Tipo de identificación desconocido: ${id.type}`}
        }
    } else {
        return {error: "No se pudo obtener la identificación."}
    }
    return dni
}

async function run() {
    const {ctx} = await setupAppContext([])

    //const codes = await Effect.runPromise(createInviteCodes(ctx, 1, 1))

    const dni = await getDNI()
    console.log("dni", dni)

    const t1 = Date.now()
    ctx.logger.logTimes("done", [t1, Date.now()])
}

run()