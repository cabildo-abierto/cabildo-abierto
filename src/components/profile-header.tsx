import SelectionComponent from "./search-selection-component";
import { unfollow, follow } from "../actions/users"
import { PermissionLevel } from "./permission-level"
import { Button } from "@mui/material"
import StateButton from "./state-button"
import Image from 'next/image'
import { ArticleIcon } from "./icons/article-icon"
import {emptyChar, getUsername} from "./utils";
import ReadOnlyEditor from "./editor/read-only-editor";
import { useUser } from "../hooks/user";
import { UserProps } from "../app/lib/definitions";
import { useState } from "react";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {BlueskyLogo} from "./icons/bluesky-logo";
import Link from "next/link";


type ProfileHeaderProps = {
    profileUser?: UserProps,
    atprotoProfile: ProfileViewDetailed,
    user?: {id: string, following: {id: string}[]}
    selected: string
    setSelected: any
    setShowingFakeNews: any
}


const FollowCounters = ({user, atprotoProfile}: {user?: UserProps, atprotoProfile: ProfileViewDetailed}) => {
    const followersCountCA = user ? user.followersCount : undefined
    const followersCountAT = atprotoProfile.followersCount
    const followingCountCA = user ? user.followsCount : undefined
    const followingCountAT = atprotoProfile.followsCount
    const [hovered, setHovered] = useState(user == undefined)

    let content

    if(!hovered) {
        content = <><div className="">
            <span className="font-bold">{followersCountCA}</span> {followersCountCA == 1 ? "seguidor" : "seguidores"}
        </div>
        <div className="sm:text-base text-sm">
            <span className="font-bold">{followingCountCA}</span> siguiendo
        </div></>
    } else {
        content = <><div className="">
            <span className="font-bold">{followersCountAT}</span> {followersCountCA == 1 ? "seguidor" : "seguidores"}
        </div>
        <div className="sm:text-base text-sm">
            <span className="font-bold">{followingCountAT}</span> siguiendo
        </div>
        <BlueskyLogo fontSize={"16"}/>
        </>
    }

    const className = "flex space-x-2 sm:text-base text-sm items-center rounded-lg px-2 py-1 cursor-pointer " + (hovered ? "bg-[var(--background-dark)]" : "")

    return <div className={className}
        onMouseEnter={() => {
            setHovered(true)
        }}
        onMouseLeave={() => {
            setHovered(user == undefined)
        }}
    >
        {content}
    </div>
}


export function ProfileHeader({
                                  profileUser,
                                  atprotoProfile,
                                  selected,
                                  setSelected,
                                  setShowingFakeNews
                              }: ProfileHeaderProps) {
    const {user} = useUser()
    const [following, setFollowing] = useState(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)

    const inCA = profileUser && profileUser.inCA
    const isLoggedInUser = user && user.did == atprotoProfile.did
    
    const onUnfollow = async () => {
        if(!user) return;
        const {error} = await unfollow(atprotoProfile.viewer.following)
        if(error) return {error}
        setFollowing(false)
        return {}
    }

    const onFollow = async () => {
        if(!user) return
        const {error} = await follow(atprotoProfile.did)
        if(error) return {error}
        setFollowing(true)
        return {}
    }

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-36">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <div className={"flex flex-col"}>
            {atprotoProfile.banner ? <button onClick={() => {}}>
                <Image
                src={atprotoProfile.banner}
                width={800}
                height={300}
                alt={atprotoProfile.handle + " banner"}
                className="w-full h-[150px]"
                />
            </button> :
            <button className="w-full h-[150px] bg-[var(--background-dark)]">
                {emptyChar}
            </button>
            }
            {atprotoProfile.avatar ? <div>
                <Image
                    src={atprotoProfile.avatar}
                    width={400}
                    height={400}
                    alt={atprotoProfile.handle + " avatar"}
                    className="w-16 h-16 rounded-full ml-6 mt-[-36px] border"
                />
            </div> : <div className={"w-16 h-16 ml-6 mt-[-36px"}>
                {emptyChar}
            </div>}
        </div>
        <div className="flex justify-between">
            <div className="ml-2 py-2">
                <span className={"text-3xl font-bold"}>
                    {getUsername(atprotoProfile)}
                </span>
                {user.displayName && <div className="text-[var(--text-light)]">
                    @{atprotoProfile.handle}
                </div>}
            </div>
            {user && <div className="flex items-center mr-2">
                {!isLoggedInUser &&
                    (following ? <StateButton
                        handleClick={onUnfollow}
                        color="inherit"
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon fontSize={"small"}/>}
                        disableElevation={true}
                        text1="Siguiendo"
                    />
                    :
                    <StateButton
                        handleClick={onFollow}
                        color="primary"
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon fontSize={"small"}/>}
                        disableElevation={true}
                        text1="Seguir"
                    />)
                }
                {/* TO DO: Implement  isOwner && false && 
                    <EditProfileButton/>
                */}
            </div>}
        </div>
        <div className="ml-2 mb-2">
            <ReadOnlyEditor initialData={atprotoProfile.description}/>
        </div>

        <div className="flex sm:flex-row flex-col px-2 space-y-1 sm:space-y-0 sm:space-x-4 mb-1 items-center">

            <FollowCounters user={profileUser} atprotoProfile={atprotoProfile}/>

            <div className="flex text-sm sm:text-base flex-col">
                {inCA ? <div className="ml-2 text-sm rounded-lg px-2 flex items-center justify-center py-1 bg-[var(--background-dark)] cursor-default space-x-1" title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                    <span className="text-[var(--text-light)]">
                        <ArticleIcon color={"inherit"}/>
                    </span>
                    <PermissionLevel
                        level={profileUser.editorStatus}
                        className="text-[var(--text-light)]"
                    />
                </div> :
                    <Link target={"_blank"} href={"https://bsky.app/profile/"+atprotoProfile.handle} className="ml-2 text-[var(--text-light)] py-1 rounded-lg bg-[var(--background-dark)] space-x-2 px-2 flex items-center justify-center">
                        <span>
                            Usuario de Bluesky
                        </span>
                    </Link>}
            </div>
        </div>
        <div className="flex mt-4">
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {
                    setSelected(v);
                    setShowingFakeNews(false)
                }}
                options={["Publicaciones", "Respuestas", ...(inCA ? ["Ediciones"] : [])]}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>

        {/*TO DO editProfileOpen && <EditProfileModal onClose={() => {setEditProfileOpen(false)}}/>*/}
    </div>
}
