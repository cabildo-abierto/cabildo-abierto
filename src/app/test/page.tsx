"use client"
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";
import {useEffect, useState} from "react";


export default function Page(){
    const [profile, setProfile] = useState<any>()

    useEffect(() => {
        async function fetchProfile(){
            const baseUrl = "http://127.0.0.1:8080/test"
            const url = new URL(baseUrl);
            url.searchParams.set('feed', "discusion")
            const f = await fetch(url, {
                method: "GET",
                credentials: "include"
            })
            setProfile(await f.json())
        }

        fetchProfile()
    }, [])

    return <div>
        <h1>Test</h1>
        {profile ? <PrettyJSON data={profile}/> : "sin perfil"}
    </div>
}