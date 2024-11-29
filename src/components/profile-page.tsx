"use client"
import {ProfileHeader, ProfileHeaderData} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import React, {useState} from "react";
import {useUser} from "../app/hooks/user";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";
import { useEditsFeed, useProfileFeed, useRepliesFeed } from "../app/hooks/contents";

type ProfilePageProps = {
    profileUser: ProfileHeaderData
}

export const ProfilePage = ({profileUser}: ProfilePageProps) => {
    const loggedInUser = useUser()
    const [selected, setSelected] = useState("Publicaciones")
    const [showingFakeNews, setShowingFakeNews] = useState(false)
    const repliesFeed = useRepliesFeed(profileUser.id)
    const profileFeed = useProfileFeed(profileUser.id)
    const editsFeed = useEditsFeed(profileUser.id)

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