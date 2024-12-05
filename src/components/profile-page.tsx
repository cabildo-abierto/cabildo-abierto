"use client"
import {ProfileHeader, FullProfile} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import {useState} from "react";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";


type ProfilePageProps = {
    profileUser: FullProfile
}

export const ProfilePage = ({profileUser}: ProfilePageProps) => {
    const [selected, setSelected] = useState("Publicaciones")
    const [showingFakeNews, setShowingFakeNews] = useState(false)

    return <div>
        <ProfileHeader
            setShowingFakeNews={setShowingFakeNews}
            selected={selected}
            profileUser={profileUser}
            setSelected={setSelected}
        />
        {selected == "Publicaciones" && !showingFakeNews && <ProfileFeed profileUser={profileUser.bskyProfile} showingFakeNews={false}/>}
        {selected == "Publicaciones" && showingFakeNews && <ProfileFeed profileUser={profileUser.bskyProfile} showingFakeNews={true}/>}
        {selected == "Respuestas" && <RepliesFeed profileUser={profileUser.bskyProfile}/>}
        {selected == "Ediciones" && <WikiFeed profileUser={profileUser.bskyProfile}/>}
    </div>
}