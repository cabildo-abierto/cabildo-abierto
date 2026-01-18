import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {v4 as uuidv4} from "uuid";
import {FilePayload} from "@cabildo-abierto/api";

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


export type JobApplicationView = {
    id: string
    name: string
    email: string
    comment: string
    cvFileName: string | null
    job: string
    createdAt: Date
    seen: boolean
}

function getFileNameFromPath(path: string) {
    // Path format is "uuid/filename" from upload
    const parts = path.split("/")
    return parts[parts.length - 1]
}

export const getJobApplications: CAHandler<{}, JobApplicationView[]> = async (ctx, agent, {}) => {
    const applications = await ctx.kysely
        .selectFrom("JobApplication")
        .select([
            "id",
            "name",
            "email",
            "comment",
            "cv",
            "job",
            "created_at as createdAt",
            "seen"
        ])
        .orderBy("created_at", "desc")
        .execute()

    const result: JobApplicationView[] = applications.map(a => ({
        ...a,
        cvFileName: a.cv ? getFileNameFromPath(a.cv) : null
    }))

    return {data: result}
}

export const getUnseenJobApplicationsCount: CAHandler<{}, {count: number}> = async (ctx, agent, {}) => {
    const result = await ctx.kysely
        .selectFrom("JobApplication")
        .select(eb => eb.fn.count<number>("id").as("count"))
        .where("seen", "=", false)
        .executeTakeFirst()

    return {data: {count: result?.count ?? 0}}
}

export const markJobApplicationSeen: CAHandler<{params: {id: string}}, {}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .updateTable("JobApplication")
        .set("seen", true)
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}

export const deleteJobApplication: CAHandler<{params: {id: string}}, {}> = async (ctx, agent, {params}) => {
    await ctx.kysely
        .deleteFrom("JobApplication")
        .where("id", "=", params.id)
        .execute()

    return {data: {}}
}