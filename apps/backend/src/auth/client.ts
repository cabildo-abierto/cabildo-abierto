import { NodeOAuthClient } from '@atproto/oauth-client-node'
import {createSessionLock, SessionStore, StateStore} from './storage.js'
import {env} from "#/lib/env.js";
import {type Redis} from "ioredis";


export const createClient = async (redis: Redis) => {
  const publicUrl = env.PUBLIC_URL
  const url = publicUrl || `http://127.0.0.1:${env.PORT}`
  const enc = encodeURIComponent
  const redirect_uri = `${url}/oauth/callback`

  const client_id = publicUrl
      ? `${publicUrl}/client-metadata.json`
      : `http://localhost?redirect_uri=${enc(redirect_uri)}&scope=${enc('atproto transition:generic transition:chat.bsky transition:email')}`

  return new NodeOAuthClient({
    clientMetadata: {
      client_name: 'Cabildo Abierto',
      client_id: client_id,
      application_type: 'web',
      grant_types: ['authorization_code', 'refresh_token'],
      scope: 'atproto transition:generic transition:chat.bsky transition:email',
      response_types: ['code'],
      redirect_uris: [redirect_uri],
      dpop_bound_access_tokens: true,
      client_uri: url,
      token_endpoint_auth_method: 'none',
      logo_uri: "https://cabildoabierto.ar/logo.svg",
      tos_uri: "https://cabildoabierto.ar/tema?i=Cabildo%20Abierto:%20T%C3%A9rminos%20y%20condiciones",
      policy_uri: "https://cabildoabierto.ar/tema?i=Cabildo%20Abierto%3A%20Pol%C3%ADtica%20de%20privacidad"
    },
    stateStore: new StateStore(redis),
    sessionStore: new SessionStore(redis),
    requestLock: createSessionLock(redis)
  })
}
