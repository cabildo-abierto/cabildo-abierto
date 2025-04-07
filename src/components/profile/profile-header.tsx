import SelectionComponent from "@/components/buscar/search-selection-component";
import {unfollow, follow} from "@/server-actions/user/users"
import {PermissionLevel} from "@/components/topics/topic/permission-level"
import {Button} from "../../../modules/ui-utils/src/button";
import StateButton from "../../../modules/ui-utils/src/state-button"
import Image from 'next/image'
import {ArticleIcon} from "../icons/article-icon"
import {emptyChar, getUsername} from "@/utils/utils";
import ReadOnlyEditor from "../editor/read-only-editor";
import {UserProps} from "@/lib/definitions";
import {useState} from "react";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import {BlueskyLogo} from "../icons/bluesky-logo";
import Link from "next/link";
import {FullscreenImageViewer} from "../feed/fast-post-image";
import {useUser} from "../../hooks/swr";


type ProfileHeaderProps = {
    profileUser?: UserProps,
    atprotoProfile: ProfileViewDetailed,
    user?: { id: string, following: { id: string }[] }
    selected: string
    setSelected: any
}


const FollowCounters = ({user, atprotoProfile}: { user?: UserProps, atprotoProfile: ProfileViewDetailed }) => {
    const followersCountCA = user ? user.followersCount : undefined
    const followersCountAT = atprotoProfile.followersCount
    const followingCountCA = user ? user.followsCount : undefined
    const followingCountAT = atprotoProfile.followsCount
    const [hovered, setHovered] = useState(user == undefined)

    let content

    if (!hovered) {
        content = <>
            <div className="">
                <span className="font-bold">{followersCountCA}</span> <span
                className={"text-[var(--text-light)]"}>{followersCountCA == 1 ? "seguidor" : "seguidores"}</span>
            </div>
            <div className="sm:text-base text-sm">
                <span className="font-bold">{followingCountCA}</span> <span
                className={"text-[var(--text-light)]"}>siguiendo</span>
            </div>
        </>
    } else {
        content = <div className={"flex space-x-1 items-center"}>
            <div>
                <span className="font-bold">{followersCountAT}</span> <span
                className={"text-[var(--text-light)]"}>{followersCountAT == 1 ? "seguidor" : "seguidores"}</span>
            </div>
            <div className="sm:text-base text-sm">
                <span className="font-bold">{followingCountAT}</span> <span
                className={"text-[var(--text-light)]"}>siguiendo</span>
            </div>
            <BlueskyLogo fontSize={"16"}/>
        </div>
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
                                  setSelected
                              }: ProfileHeaderProps) {
    const {user} = useUser()
    const [following, setFollowing] = useState(atprotoProfile.viewer && atprotoProfile.viewer.following != undefined)
    const [viewingProfilePic, setViewingProfilePic] = useState(null)
    const [viewingBanner, setViewingBanner] = useState(null)

    const inCA = profileUser && profileUser.inCA
    const isLoggedInUser = user && user.did == atprotoProfile.did

    const onUnfollow = async () => {
        if (!user) return;
        const {error} = await unfollow(atprotoProfile.viewer.following)
        if (error) return {error}
        setFollowing(false)
        return {}
    }

    const onFollow = async () => {
        if (!user) return
        const {error} = await follow(atprotoProfile.did)
        if (error) return {error}
        setFollowing(true)
        return {}
    }

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0,
                }}
            >
                <div
                    className={"pb-1 mx-2 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <div className={"flex flex-col"}>
            {atprotoProfile.banner ? <div>
                    <FullscreenImageViewer
                        images={[atprotoProfile.banner]}
                        viewing={viewingBanner}
                        setViewing={setViewingBanner}
                        className={"min-w-[700px]"}
                    />
                    <Image
                        src={atprotoProfile.banner}
                        width={800}
                        height={300}
                        alt={atprotoProfile.handle + " banner"}
                        className="max-[500px]:w-screen max-[680px]:w-[100vw-80px] max-[680px]:h-auto w-full h-[150px] cursor-pointer"
                        onClick={() => {
                            setViewingBanner(0)
                        }}
                    />
                </div> :
                <div className="w-full h-[130px] bg-[var(--background-dark)]">
                    {emptyChar}
                </div>
            }
            {atprotoProfile.avatar ? <div>
                <FullscreenImageViewer
                    images={[atprotoProfile.avatar]}
                    viewing={viewingProfilePic}
                    setViewing={setViewingProfilePic}
                    className={"rounded-full border"}
                />
                <Image
                    src={atprotoProfile.avatar}
                    width={400}
                    height={400}
                    alt={atprotoProfile.handle + " avatar"}
                    className="w-[88px] h-[88px] rounded-full ml-6 mt-[-44px] border cursor-pointer"
                    onClick={() => {
                        setViewingProfilePic(0)
                    }}
                />
            </div> : <div className={"w-24 h-24 ml-6 mt-[-48px]"}>
                {emptyChar}
            </div>}
        </div>
        <div className="flex justify-between">
            <div className="ml-2 py-2">
                <span className={"min-[500px]:text-2xl text-lg font-bold"}>
                    {getUsername(atprotoProfile)}
                </span>
                {atprotoProfile.displayName && <div className="text-[var(--text-light)]">
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
            </div>}
        </div>

        <div className="ml-2 mb-2">
            <ReadOnlyEditor text={atprotoProfile.description} format={"plain-text"}/>
        </div>

        <div className="flex flex-col items-start px-2 space-y-2 mb-1">

            <FollowCounters user={profileUser} atprotoProfile={atprotoProfile}/>

            <div className="flex text-sm sm:text-base">
                {inCA ? <div
                        className="text-sm rounded-lg px-2 flex items-center justify-center py-1 bg-[var(--background-dark)] cursor-default space-x-1"
                        title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                    <span className="text-[var(--text-light)]">
                        <ArticleIcon color={"inherit"}/>
                    </span>
                        <PermissionLevel
                            level={profileUser.editorStatus}
                            className="text-[var(--text-light)] text-xs"
                        />
                    </div> :
                    <Link target={"_blank"} href={"https://bsky.app/profile/" + atprotoProfile.handle}
                          className="text-[var(--text-light)] py-1 rounded-lg bg-[var(--background-dark)] space-x-2 px-2 flex items-center justify-center">
                        <span>
                            Usuario de Bluesky
                        </span>
                    </Link>}
            </div>
        </div>
        <div className="flex mt-4 overflow-scroll no-scrollbar">
            <SelectionComponent
                selected={selected}
                onSelection={(v) => {
                    setSelected(v)
                }}
                options={["Publicaciones", "Respuestas", ...(inCA ? ["Ediciones"] : [])]}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>
    </div>
}
