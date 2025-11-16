import {CAHandlerNoAuth} from "#/utils/handler.js";
import {FilePayload} from "#/services/storage/storage.js";
import {v4 as uuidv4} from "uuid";

type JobApplication = {
    name: string
    email: string
    comment: string
    CV: FilePayload | null
    job: string
}

export const jobApplicationHandler: CAHandlerNoAuth<JobApplication> = async (ctx, agent, params) => {
    let cv: string | undefined;
    if(params.CV){
        const res = await ctx.storage?.upload(params.CV, "job-applications")
        if(!res || res.error) {
            return {error: "Ocurrió un error al guardar la solicitud. Volvé a intentar o contactanos por otro medio."}
        }
        cv = res.path
    }

    await ctx.kysely
        .insertInto("JobApplication")
        .values([{
            id: uuidv4(),
            name: params.name,
            email: params.email,
            comment: params.comment,
            job: params.job,
            cv
        }])
        .execute()

    return {data: {}}
}