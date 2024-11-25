"use client"
import { Button, TextField } from "@mui/material"
import { useCallback, useContext, useEffect, useState } from "react"
import { isValidHandle } from '@atproto/syntax'
import { createClient, resolveHandle, resolvePDSClient } from "../../services/clientUtils"
import { SessionContext } from '../../contexts/SessionContext'
import { AppBskyActorDefs, BskyAgent } from '@atproto/api'
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import LoadingSpinner from "../../components/loading-spinner"


const Page = () => {
    const manager = useContext(SessionContext)
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<undefined | ProfileViewDetailed>(undefined)

    const LoadProfiles = useCallback(async () => {
        setLoading(true)
        console.log("getting identities")
        const ids = await manager.getIdentities()
        if (ids.length === 0) {
          console.log("no ids")
          setLoading(false)
          return
        }
        // get avatar
        const agent = new BskyAgent({
          service: 'https://public.api.bsky.app'
        })
        const profiles = (await agent.getProfiles({ actors: ids.map(id => id.handle) })).data.profiles

        setProfile(profiles[0])
        setLoading(false)
    }, [setLoading, manager])

    useEffect(() => {
        void LoadProfiles()
    }, [manager, LoadProfiles])

    return <div className="h-screen w-screen flex flex-col items-center justify-center">

        <div className="w-[600px] flex flex-col space-y-4">
        <h1>¡Bienvenido a Bluesky!</h1>

        {loading && <LoadingSpinner/>}
        <div>
            {profile && profile.handle} {profile && profile.displayName}
        </div>

        </div>
    </div>
}


export default Page