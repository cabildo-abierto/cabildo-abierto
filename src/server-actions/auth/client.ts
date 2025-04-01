import { NodeOAuthClient } from '@atproto/oauth-client-node'
import { SessionStore, StateStore } from './storage'


export const createClient = async () => {
  const publicUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : undefined
  const url = publicUrl || `http://127.0.0.1:3000`

  const enc = encodeURIComponent

  const client_id = publicUrl
      ? `${url}/client-metadata.json`
      : `http://localhost?redirect_uri=${enc(`${url}/api/oauth/callback`)}&scope=${enc('atproto transition:generic')}`

  return new NodeOAuthClient({
    clientMetadata: {
      client_id: client_id,
      client_name: 'Cabildo Abierto',
      application_type: 'web',
      grant_types: ['authorization_code', 'refresh_token'],
      scope: 'atproto transition:generic',
      response_types: ['code'],
      redirect_uris: [`${url}/api/oauth/callback`],
      dpop_bound_access_tokens: true,
      client_uri: url,
      token_endpoint_auth_method: 'none',
      logo_uri: 'https://www.cabildoabierto.com.ar/logo.svg',
      tos_uri: "https://www.cabildoabierto.com.ar/tema?i=Cabildo%20Abierto:%20T%C3%A9rminos%20y%20condiciones",
      policy_uri: "https://www.cabildoabierto.com.ar/tema?i=Cabildo%20Abierto%3A%20Pol%C3%ADtica%20de%20privacidad"
    },
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  })
}
