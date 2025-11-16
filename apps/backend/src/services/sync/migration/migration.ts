import {CAHandler, CAHandlerNoAuth} from "#/utils/handler.js";
import {AtpAgent} from "@atproto/api";
import {Secp256k1Keypair} from "@atproto/crypto";
import {OutputSchema as Credentials} from "@atproto/api/dist/client/types/com/atproto/identity/getRecommendedDidCredentials.js"

const NEW_PDS_URL = "https://cabildo.ar"

type MigrateToCAProps = {
    inviteCode: string
    newHandle: string
    newEmail: string
    newPassword: string
}

export const migrateToCA: CAHandler<MigrateToCAProps, {credentials: Credentials}> = async (ctx, agent, params) => {
    const {
        newPassword,
        inviteCode,
        newHandle,
        newEmail
    } = params

    const newAgent = new AtpAgent({ service: NEW_PDS_URL })

    const accountDid = agent.did

    // Create account
    // ------------------

    const describeRes = await newAgent.com.atproto.server.describeServer()
    const newServerDid = describeRes.data.did

    const serviceJwtRes = await agent.bsky.com.atproto.server.getServiceAuth({
        aud: newServerDid,
        lxm: 'com.atproto.server.createAccount',
    })
    const serviceJwt = serviceJwtRes.data.token

    await newAgent.com.atproto.server.createAccount(
        {
            handle: newHandle,
            email: newEmail,
            password: newPassword,
            did: accountDid,
            inviteCode,
        },
        {
            headers: { authorization: `Bearer ${serviceJwt}` },
            encoding: 'application/json',
        },
    )
    await newAgent.login({
        identifier: newHandle,
        password: newPassword,
    })
    ctx.logger.pino.info("Account created!")

    // Migrate Data
    // ------------------

    ctx.logger.pino.info("Migrating records...")
    const repoRes = await agent.bsky.com.atproto.sync.getRepo({ did: accountDid })
    await newAgent.com.atproto.repo.importRepo(repoRes.data, {
        encoding: 'application/vnd.ipld.car',
    })

    ctx.logger.pino.info("Migrating blobs...")
    let blobCursor: string | undefined = undefined
    do {
        const listedBlobs = await agent.bsky.com.atproto.sync.listBlobs({
            did: accountDid,
            cursor: blobCursor,
        })
        for (const cid of listedBlobs.data.cids) {
            const blobRes = await agent.bsky.com.atproto.sync.getBlob({
                did: accountDid,
                cid,
            })
            await newAgent.com.atproto.repo.uploadBlob(blobRes.data, {
                encoding: blobRes.headers['content-type'],
            })
        }
        blobCursor = listedBlobs.data.cursor
    } while (blobCursor)

    ctx.logger.pino.info("Migrating preferences...")
    const prefs = await agent.bsky.app.bsky.actor.getPreferences()
    await newAgent.app.bsky.actor.putPreferences(prefs.data)


    // Migrate Identity
    // ------------------

    ctx.logger.pino.info("Migrating identity...")
    const ui8 = require('uint8arrays')
    const recoveryKey = await Secp256k1Keypair.create({ exportable: true })
    const privateKeyBytes = await recoveryKey.export()
    const privateKey = ui8.toString(privateKeyBytes, 'hex')

    await agent.bsky.com.atproto.identity.requestPlcOperationSignature()

    const getDidCredentials = await newAgent.com.atproto.identity.getRecommendedDidCredentials()
    const rotationKeys = getDidCredentials.data.rotationKeys ?? []
    if (!rotationKeys) {
        throw new Error('No rotation key provided')
    }

    ctx.logger.pino.info(
        `❗ Tu clave de recuperación es: ${privateKey}. Por favor, guardala en un lugar seguro. ❗`,
    )

    const credentials: Credentials = {
        ...getDidCredentials.data,
        rotationKeys: [recoveryKey.did(), ...rotationKeys],
    }

    return {data: {credentials}}
}


export const finishMigrationToCA: CAHandler<{credentials: Credentials, token: string}, {}> = async (ctx, agent, params) => {
    const {token, credentials} = params
    const newAgent = new AtpAgent({ service: NEW_PDS_URL })

    const plcOp = await agent.bsky.com.atproto.identity.signPlcOperation({
        token,
        ...credentials,
    })

    await newAgent.com.atproto.identity.submitPlcOperation({
        operation: plcOp.data.operation,
    })

    // Finalize Migration
    // ------------------
    console.log("Finalizing migration...")

    await newAgent.com.atproto.server.activateAccount()
    await agent.bsky.com.atproto.server.deactivateAccount({})

    return {data: {}}
}

type SignUpProps = {
    handle: string
    email: string
    password: string
    inviteCode: string
}


export const createAccountInCabildoPDS: CAHandlerNoAuth<SignUpProps, {}> = async (ctx, agent, params) => {
    const {
        password,
        inviteCode,
        handle,
        email
    } = params

    const newAgent = new AtpAgent({ service: NEW_PDS_URL })

    await newAgent.com.atproto.server.createAccount(
        {
            handle,
            email,
            password,
            inviteCode,
        },
        {
            encoding: 'application/json',
        }
    )
    await newAgent.login({
        identifier: handle,
        password,
    })

    return {data: {}}
}