import {AppContext} from "#/setup.js";


export async function updatePayments(ctx: AppContext) {
    /***
     Pasan a confirmados los pagos cuyos contenidos hayan sido creados hace más de 30 días
     ***/
    const oneMonthAgo = new Date(Date.now() - 30*24*3600*1000)
    const promises = await ctx.kysely
        .selectFrom("PaymentPromise")
        .innerJoin("Record", "Record.uri", "PaymentPromise.contentId")
        .select([
            "id",
            "Record.uri",
            "Record.created_at as recordCreatedAt"
        ])
        .where("PaymentPromise.status", "=", "Pending")
        .execute()
    for(let i = 0; i < promises.length; i++){
        const p = promises[i]
        if(p.recordCreatedAt < oneMonthAgo){
            await ctx.kysely
                .updateTable("PaymentPromise")
                .set("status", "Confirmed")
                .where("id", "=", p.id)
                .execute()
        }
    }
}