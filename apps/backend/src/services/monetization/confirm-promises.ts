import {AppContext} from "#/setup.js";

export async function confirmPromises(ctx: AppContext) {
    /* confirmamos todas las asignaciones de pagos a contenidos
    * que hayan sido creados hace al menos 30 días y que
    * en caso de ser ediciones de temas estén aceptadas
    * */

    const lastMonth = new Date(Date.now() - 1000*3600*24*30)

    ctx.logger.pino.info("confirming promises")

    const paymentsToUpdate = await ctx.kysely
        .selectFrom("AssignedPayment")
        .select("id")
        .innerJoin("Record", "Record.uri", "AssignedPayment.contentId")
        .leftJoin("TopicVersion", "TopicVersion.uri", "Record.uri")
        .where("Record.created_at_tz", "<", lastMonth)
        .where(eb => eb.or([
            eb("Record.collection", "=", "ar.cabildoabierto.feed.article"),
            eb("TopicVersion.accepted", "=", true)
        ]))
        .where("AssignedPayment.status", "=", "Pending")
        .execute()

    ctx.logger.pino.info({count: paymentsToUpdate.length}, "confirming promises")

    if(paymentsToUpdate.length > 0){
        await ctx.kysely
            .updateTable("AssignedPayment")
            .set("status", "Confirmed")
            .where("AssignedPayment.id", "in", paymentsToUpdate.map(p => p.id))
            .execute()
    }

    const months = await ctx.kysely
        .selectFrom("UserMonth")
        .select([
            "UserMonth.id",
            "UserMonth.value",
            "UserMonth.userId",
            eb => eb
                .selectFrom("AssignedPayment")
                .select(eb => eb.fn.sum<number>("AssignedPayment.amount").as("assigned"))
                .whereRef("AssignedPayment.userMonthId", "=", "UserMonth.id")
                .where("AssignedPayment.status", "!=", "Pending").as("totalConfirmed")
        ])
        .where("UserMonth.fullyConfirmed", "=", false)
        .where("UserMonth.wasActive", "=", true)
        .execute()

    const fullyConfirmed: string[] = []
    months.forEach(m => {
        if(m.value * 0.7 - (m.totalConfirmed ?? 0) <= 5) {
            fullyConfirmed.push(m.id)
        } else if(m.value > 0){
            ctx.logger.pino.info({m}, "month not confirmed")
        }
    })

    ctx.logger.pino.info({count: fullyConfirmed.length}, "setting months to fully confirmed")
    if(fullyConfirmed.length > 0) {
        await ctx.kysely
            .updateTable("UserMonth")
            .set("fullyConfirmed", true)
            .where("UserMonth.id", "in", fullyConfirmed)
            .execute()
    }
}