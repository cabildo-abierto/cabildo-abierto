import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'
import { db } from "../db"

export class StateStore implements NodeSavedStateStore {
    constructor() {}
    async get(key: string): Promise<NodeSavedState | undefined> {

        const result = await db.authState.findFirst({
            where: {
                key: key
            }
        })

        if (!result) return
        return JSON.parse(result.state) as NodeSavedState
        
    }
    async set(key: string, val: NodeSavedState) {
        const state = JSON.stringify(val)
        await db.authState.upsert({
          where: { key }, 
          update: { state },
          create: { key, state }, 
        })
    }
    async del(key: string) {
        await db.authState.delete({
            where: {
                key: key
            }
        })
    }
}

export class SessionStore implements NodeSavedSessionStore {
  constructor() {}
  async get(key: string): Promise<NodeSavedSession | undefined> {

      const result = await db.authSession.findFirst({where: {key}})

      if (!result) return
      return JSON.parse(result.session) as NodeSavedSession
  
  }
    async set(key: string, val: NodeSavedSession) {
        const session = JSON.stringify(val)


        await db.authSession.upsert({
            where: { key }, 
            update: { session },
            create: { key, session }, 
        })
    }
    async del(key: string) {
        await db.authSession.delete({where: {key}})
    }
}
