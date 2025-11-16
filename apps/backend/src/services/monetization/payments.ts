import {AppContext} from "#/setup.js";
import {createUserMonths} from "#/services/monetization/user-months.js";
import {assignPromises} from "#/services/monetization/assign-promises.js";
import {confirmPromises} from "#/services/monetization/confirm-promises.js";

/*
assignPayments() // ejecuta cada media hora
1. createUserMonths()
2. assignMonthPromises(m) para todos los meses que no estén 100% confirmados
3. confirmPaymentPromises()

createUserMonths() // una vez cada media hora.
Por cada usuario activo por mes se crea un UserMonth (al terminar el mes)
A cada UserMonth se le asigna un valor (el valor mensual del momento).

assignMonthPromises(m)
Para un UserMonth se reasignan todas las promesas _no confirmadas_ en función de las lecturas
 y de las promesas que haya ya confirmadas o pagadas.

confirmPaymentPromises()
Se confirman las promesas que corresponda confirmar.
*/


export async function assignPayments(ctx: AppContext) {
    await createUserMonths(ctx)
    await assignPromises(ctx)
    await confirmPromises(ctx)
}