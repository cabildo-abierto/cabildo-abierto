import * as xrpc from '../app/xrpc-api'
import { isValidHandle } from '@atproto/syntax'
import { ServiceClient } from '@atproto/xrpc'
import type { DidDocument } from '@atproto/identity'

export const createClient = (hostname: string): xrpc.AtpServiceClient => {
  const baseClient = new xrpc.AtpBaseClient()
  const serviceClient = new ServiceClient(baseClient.xrpc, `https://${hostname}`)
  const atpServiceClient = new xrpc.AtpServiceClient(baseClient, serviceClient)
  return atpServiceClient
}

export const resolveHandle = async (identifier: string, client: xrpc.AtpServiceClient): Promise<string> => {
  let did = identifier
  if (isValidHandle(identifier)) {
    const resolveResult = await client.com.atproto.identity.resolveHandle({ handle: identifier })
    did = resolveResult.data.did
  }
  return did
}

export const resolvePDSClient = async (identifier: string, client: xrpc.AtpServiceClient): Promise<string> => {
  if (isValidHandle(identifier)) {
    identifier = await resolveHandle(identifier, client)
  }

  const isPlc = identifier.startsWith('did:plc')
  const isWeb = identifier.startsWith('did:web')
  if (!isPlc && !isWeb) {
    throw new Error('Unsupported did method')
  }
  let result: DidDocument | undefined
  if (isPlc) {
    result = await (await fetch(`https://plc.directory/${identifier}`)).json() as DidDocument
  } else if (isWeb) {
    const parsedId = identifier.split(':').slice(2).join(':')
    const parts = parsedId.split(':').map(decodeURIComponent)
    const DOC_PATH = '/.well-known/did.json'
    if (parts.length > 1) {
      throw new Error('Did with path is not supported')
    }
    const path = parts[0] + DOC_PATH
    result = await (await fetch(`https://${path}`, { headers: { 'accept-encoding': 'json' } })).json() as DidDocument
  }
  if (result === undefined) {
    throw new Error('Unable to resolve DID')
  }
  if (result.service === undefined) {
    throw new Error("'service' section was not found onthe DID document")
  }
  for (const entry of result.service) {
    if (entry.id === '#atproto_pds') {
      return new URL(entry.serviceEndpoint as string).host
    }
  }
  throw new Error('#atproto_pds section was not found on the DID document')
}