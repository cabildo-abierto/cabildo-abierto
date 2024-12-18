"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import {useState} from "react";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";
import {UserProps} from "../app/lib/definitions";


type ProfilePageProps = {
    profileUser: UserProps
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
        {selected == "Publicaciones" && !showingFakeNews && <ProfileFeed profileUser={profileUser} showingFakeNews={false}/>}
        {selected == "Publicaciones" && showingFakeNews && <ProfileFeed profileUser={profileUser} showingFakeNews={true}/>}
        {selected == "Respuestas" && <RepliesFeed profileUser={profileUser}/>}
        {selected == "Ediciones" && <WikiFeed profileUser={profileUser}/>}
    </div>
}