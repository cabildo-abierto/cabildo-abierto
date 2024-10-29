"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import React, {useEffect, useState} from "react";
import {useUser} from "../app/hooks/user";
import {UserProps} from "../app/lib/definitions";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";
import { preload } from "swr";
import { fetcher } from "../app/hooks/utils";
import { useEditsFeed, useProfileFeed, useRepliesFeed } from "../app/hooks/contents";

type ProfilePageProps = {
    profileUser: UserProps
}

export const ProfilePage = ({profileUser}: ProfilePageProps) => {
    const loggedInUser = useUser()
    const [selected, setSelected] = useState("Publicaciones")
    const [showingFakeNews, setShowingFakeNews] = useState(false)
    const repliesFeed = useRepliesFeed(profileUser.id)
    const profileFeed = useProfileFeed(profileUser.id)
    const editsFeed = useEditsFeed(profileUser.id)
    
    useEffect(() => {
        const loadAmount = 50
        if(repliesFeed.feed){
            for(let i = 0; i < Math.min(repliesFeed.feed.length, loadAmount); i++){
                preload("/api/content/"+repliesFeed.feed[i].id, fetcher)
            }
        }
        if(profileFeed.feed){
            for(let i = 0; i < Math.min(profileFeed.feed.length, loadAmount); i++){
                preload("/api/content/"+profileFeed.feed[i].id, fetcher)
            }
        }
        if(editsFeed.feed){
            for(let i = 0; i < Math.min(editsFeed.feed.length, loadAmount); i++){
                preload("/api/content/"+editsFeed.feed[i].id, fetcher)
            }
        }
    }, [])

    return <div>
        <div className="mb-4">
            <ProfileHeader
                setShowingFakeNews={setShowingFakeNews}
                selected={selected}
                profileUser={profileUser} user={loggedInUser.user}
                setSelected={setSelected}
            />
        </div>
        {selected == "Publicaciones" && !showingFakeNews && <ProfileFeed profileUser={profileUser} showingFakeNews={false}/>}
        {selected == "Publicaciones" && showingFakeNews && <ProfileFeed profileUser={profileUser} showingFakeNews={true}/>}
        {selected == "Respuestas" && <RepliesFeed profileUser={profileUser}/>}
        {selected == "Ediciones en temas" && <WikiFeed profileUser={profileUser}/>}
    </div>
}