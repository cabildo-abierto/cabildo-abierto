import {AppContext} from "#/setup.js";
import {CAHandlerNoAuth} from "#/utils/handler.js";


export async function unsubscribe(ctx: AppContext, email: string) {
    await ctx.kysely
        .updateTable("MailingListSubscription")
        .where("email", "=", email)
        .set("status", "Unsubscribed")
        .execute()
    ctx.logger.pino.info({email}, "unsuscribed from mailing list")
}


export const unsubscribeHandler: CAHandlerNoAuth<{email: string}, {}> = async (ctx, agent, params) => {
    const email = params.email
    try {
        await unsubscribe(ctx, email)
    } catch (error) {
        ctx.logger.pino.error({email, error},"error on unsubscribe")
        return {error: "Ocurrió un error en la desuscipción."}
    }

    return {data: {}}
}
