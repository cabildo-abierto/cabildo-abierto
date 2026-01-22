import {CAHandler} from "#/utils/handler.js";
import {Dataplane} from "#/services/hydration/dataplane.js";
import {hydrateProfileViewBasic} from "#/services/hydration/profile.js";
import {OrgType, ValidationRequestProps, ValidationRequestView} from "@cabildo-abierto/api"
import {createHash} from "crypto";
import {v4 as uuidv4} from "uuid";
import {AppContext} from "#/setup.js";
import {acceptValidationRequestFromPayment} from "#/services/monetization/donations.js";



type ValidationType = "Organizacion" | "Persona"
type ValidationRequestResult = "Aceptada" | "Rechazada" | "Pendiente"


export const createValidationRequest: CAHandler<ValidationRequestProps, {}> = async (ctx, agent, request) => {
    if(!ctx.storage) return {error: "Error al guardar."}
    try {
        let data: {
            type: ValidationType
            documentacion: string[]
            userId: string
            comentarios?: string
            sitioWeb?: string
            email?: string
            tipoOrg?: string
            dniFrente?: string
            dniDorso?: string
            result: "Pendiente"
        }
        if(request.tipo == "org"){
            const documentacion = request.documentacion ? await Promise.all(request.documentacion.map((f => ctx.storage?.upload(f, 'validation-documents')))) : []

            if (documentacion && documentacion.some(x => !x || x && x.error)) return {error: "Ocurrió un error al procesar la solicitud."}

            data = {
                type: "Organizacion",
                documentacion: documentacion ? documentacion.map(d => d?.path) as string[] : [],
                userId: agent.did,
                comentarios: request.comentarios,
                sitioWeb: request.sitioWeb,
                email: request.email,
                tipoOrg: request.tipoOrg,
                result: "Pendiente"
            }
        } else if(request.tipo == "persona") {
            if(request.metodo == "dni") {
                const dniFrente = request.dniFrente ? await ctx.storage.upload(request.dniFrente, 'validation-documents') : undefined
                const dniDorso = request.dniDorso ? await ctx.storage.upload(request.dniDorso, 'validation-documents') : undefined
                if (dniFrente && dniFrente.error) return {error: "Ocurrió un error al procesar la solicitud."}
                if (dniDorso && dniDorso.error) return {error: "Ocurrió un error al procesar la solicitud."}
                if (!dniFrente) return {error: "Debe incluir una foto del frente de su DNI."}
                if (!dniDorso) return {error: "Debe incluir una foto del dorso de su DNI."}

                data = {
                    type: "Persona",
                    dniFrente: dniFrente?.path,
                    dniDorso: dniDorso?.path,
                    userId: agent.did,
                    documentacion: [],
                    result: "Pendiente"
                }
            } else if(request.metodo == "mp") {
                data = {
                    type: "Persona",
                    documentacion: [],
                    userId: agent.did,
                    result: "Pendiente"
                }
            } else {
                return {error: "Método de verificación inválido."}
            }
        } else {
            return {error: "Tipo de verificación inválido."}
        }

        await ctx.kysely
            .insertInto("ValidationRequest")
            .values([{
                ...data,
                id: uuidv4()
            }])
            .onConflict(oc => oc.column("userId").doUpdateSet(eb => ({
                result: eb.ref("excluded.result"),
                type: eb.ref("excluded.type"),
                documentacion: eb.ref("excluded.documentacion"),
                userId: eb.ref("excluded.userId"),
                comentarios: eb.ref("excluded.comentarios"),
                sitioWeb: eb.ref("excluded.sitioWeb"),
                email: eb.ref("excluded.email"),
                dniFrente: eb.ref("excluded.dniFrente"),
                dniDorso: eb.ref("excluded.dniDorso"),
            })))
            .execute()

    } catch (error) {
        ctx.logger.pino.error({error}, "error creating validation request")
        return {error: "Ocurrió un error al crear la solicitud. Volvé a intentar."}
    }

    return {data: {}}
}


export const getValidationRequest: CAHandler<{}, { type: "org" | "persona" | null, result?: ValidationRequestResult }> = async (ctx, agent, {}) => {
    const res = await ctx.kysely
        .selectFrom("ValidationRequest")
        .select(["type", "result", "dniFrente"])
        .where("userId", "=", agent.did)
        .orderBy("ValidationRequest.created_at_tz desc")
        .executeTakeFirst()

    if(!res) return {data: {type: null}}

    if(res.type == "Persona" && res.dniFrente == null && res.result != "Aceptada") {
        return {data: {type: null}}
    }

    return {
        data: {
            type: res.type == "Persona" ? "persona" : "org",
            result: res.result
        }
    }
}


export const cancelValidationRequest: CAHandler<{}, {}> = async (ctx, agent, {}) => {
    await ctx.kysely.deleteFrom("ValidationRequest")
        .where("userId", "=", agent.did)
        .execute()

    return {data: {}}
}


function getFileNameFromPath(path: string) {
    const s = path.split("::")
    return s[s.length - 1]
}


export const getPendingValidationRequestsCount: CAHandler<{}, {count: number}> = async (ctx, agent, {}) => {
    const result = await ctx.kysely
        .selectFrom("ValidationRequest")
        .select(eb => eb.fn.count<number>("id").as("count"))
        .where("result", "=", "Pendiente")
        .executeTakeFirst()

    return {data: {count: result?.count ?? 0}}
}


export const getPendingValidationRequests: CAHandler<{}, {
    requests: ValidationRequestView[],
    count: number
}> = async (ctx, agent, {}) => {
    const [requests, count] = await Promise.all([
        ctx.kysely
            .selectFrom("ValidationRequest")
            .select([
                "id",
                "dniFrente",
                "dniDorso",
                "created_at_tz as createdAt",
                "documentacion",
                "userId",
                "type",
                "tipoOrg",
                "sitioWeb",
                "comentarios",
                "sitioWeb",
                "email"
            ])
            .where("result", "=", "Pendiente")
            .limit(10)
            .execute(),
        ctx.kysely.selectFrom("ValidationRequest")
            .select(eb => eb.fn.count<number>("id").as("count"))
            .where("result", "=", "Pendiente")
            .executeTakeFirst()
    ])

    const dataplane = new Dataplane(ctx, agent)

    const files = [
        ...requests.map(r => r.dniFrente),
        ...requests.map(r => r.dniDorso),
        ...requests.flatMap(r => r.documentacion),
    ].filter(x => x != null)

    await Promise.all([
        dataplane.fetchProfileViewHydrationData(requests.map(r => r.userId)),
        dataplane.fetchFilesFromStorage(files, "validation-documents")
    ])

    const res: ValidationRequestView[] = requests.map(r => {
        const user = hydrateProfileViewBasic(ctx, r.userId, dataplane)
        if (!user) {
            ctx.logger.pino.info({r}, "error hydrating validation request")
            return null
        }
        const tipo: "org" | "persona" = r.type == "Persona" ? "persona" : "org"
        if (tipo == "org") {
            const req: ValidationRequestView = {
                tipo: "org",
                ...r,
                tipoOrg: r.tipoOrg as OrgType,
                user,
                sitioWeb: r.sitioWeb ?? undefined,
                email: r.email ?? undefined,
                comentarios: r.comentarios ?? undefined,
                documentacion: r.documentacion ? r.documentacion.map(d => {
                    return {
                        fileName: getFileNameFromPath(d),
                        base64: dataplane.s3files.get("validation-documents:" + d) ?? "not found"
                    }
                }) : []
            }
            return req
        } else {
            const req: ValidationRequestView = {
                tipo: "persona",
                ...r,
                user,
                dniFrente: r.dniFrente ? {
                    fileName: getFileNameFromPath(r.dniFrente),
                    base64: dataplane.s3files.get("validation-documents:" + r.dniFrente) ?? "not found"
                } : null,
                dniDorso: r.dniDorso ? {
                    fileName: getFileNameFromPath(r.dniDorso),
                    base64: dataplane.s3files.get("validation-documents:" + r.dniDorso) ?? "not found"
                } : null
            }
            return req
        }
    }).filter(x => x != null)

    return {data: {requests: res, count: count?.count ?? 0}}
}


type ValidationRequestResultProps = {
    id: string
    result: "accept" | "reject"
    reason: string
    dni?: number
}


export async function getHashFromDNI(dni: number) {
    const hash = createHash('sha256');
    hash.update(dni.toString());
    return hash.digest('hex');
}


export async function setValidationRequestResult(ctx: AppContext, result: ValidationRequestResultProps) {
    return ctx.kysely.transaction().execute(async trx => {
        const req = await trx
            .selectFrom("ValidationRequest")
            .innerJoin("User", "User.did", "ValidationRequest.userId")
            .select([
                "type",
                "did",
                "handle",
                "displayName",
                "avatar",
                "banner"
            ])
            .where("id", "=", result.id)
            .executeTakeFirst()

        if (!req) return {error: "No se encontró la solicitud."}

        const {type, ...user} = req

        await trx.updateTable("ValidationRequest")
            .set("result", result.result == "accept" ? "Aceptada" : "Rechazada")
            .where("id", "=", result.id)
            .execute()

        if (type == "Persona") {
            if(result.result == "accept"){
                if (!result.dni) {
                    return {error: "Falta el número de DNI."}
                }
                const userValidationHash = await getHashFromDNI(result.dni)
                await trx.updateTable("User")
                    .set("userValidationHash", userValidationHash)
                    .where("did", "=", user.did)
                    .execute()
                await ctx.redisCache.onEvent("verification-update", [user.did])
            }
        } else {
            if(result.result == "accept"){
                await trx.updateTable("User")
                    .set("orgValidation", JSON.stringify(user))
                    .where("did", "=", user.did)
                    .execute()
                await ctx.redisCache.onEvent("verification-update", [user.did])
            }
        }
        return {data: {}}
    })
}


export const setValidationRequestResultHandler: CAHandler<ValidationRequestResultProps, {}> = async (ctx, agent, result) => {
    return await setValidationRequestResult(ctx, result)
}


export const attemptMPVerification: CAHandler<{}, {}> = async (ctx, agent, {}) => {

    const data = await ctx.kysely
        .selectFrom("Donation")
        .where("userById", "=", agent.did)
        .select([
            "Donation.transactionId"
        ])
        .execute()

    const {error} = await createValidationRequest(
        ctx,
        agent,
        {tipo: "persona", metodo: "mp"}
    )

    if(error) {
        return {
            error: "Ocurrió un error al solicitar la verificación."
        }
    }

    for(let i = 0; i < data.length; i++) {
        const transactionId = data[i].transactionId
        if(!transactionId) continue
        const {error} = await acceptValidationRequestFromPayment(
            ctx,
            agent.did,
            transactionId
        )
        if(error) {
            ctx.logger.pino.error({transactionId, error}, "attempt to accept validation request from payment failed")
        }
        if(!error) {
            return {data: {}}
        }
    }

    ctx.logger.pino.error({data}, "attempt to verify using mp failed")

    return {error: "Ocurrió un error al verificar la cuenta."}
}