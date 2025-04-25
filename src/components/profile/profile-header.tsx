import SelectionComponent from "@/components/buscar/search-selection-component";
import {PermissionLevel} from "@/components/topics/topic/permission-level"
import {Button} from "../../../modules/ui-utils/src/button";
import Image from 'next/image'
import {ArticleIcon} from "../icons/article-icon"
import {emptyChar, getUsername} from "@/utils/utils";
import {useState} from "react";
import {BlueskyLogo} from "../icons/bluesky-logo";
import Link from "next/link";
import {ProfileDescription} from "@/components/profile/profile-description";
import {FullscreenImageViewer} from "../images/fullscreen-image-viewer";
import {FollowButton} from "@/components/profile/profile-utils";
import {Profile} from "@/lib/types";
import {FollowCount} from "@/components/profile/follow/followx";
import {FollowCounters} from "@/components/profile/follow/follow-counters";


type ProfileHeaderProps = {
    profile: Profile
    user?: { id: string, following: { id: string }[] }
    selected: string
    setSelected: any
}

export function ProfileHeader({
                                  profile,
                                  selected,
                                  setSelected
                              }: ProfileHeaderProps) {
    const [viewingProfilePic, setViewingProfilePic] = useState(null)
    const [viewingBanner, setViewingBanner] = useState(null)

    const inCA = profile && profile.ca && profile.ca.inCA

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
            {profile.bsky.banner ? <div>
                    <FullscreenImageViewer
                        images={[profile.bsky.banner]}
                        viewing={viewingBanner}
                        setViewing={setViewingBanner}
                        className={"min-w-[700px]"}
                    />
                    <Image
                        src={profile.bsky.banner}
                        width={800}
                        height={300}
                        alt={profile.bsky.handle + " banner"}
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
            {profile.bsky.avatar ? <div>
                <FullscreenImageViewer
                    images={[profile.bsky.avatar]}
                    viewing={viewingProfilePic}
                    setViewing={setViewingProfilePic}
                    className={"rounded-full border"}
                />
                <Image
                    src={profile.bsky.avatar}
                    width={400}
                    height={400}
                    alt={profile.bsky.handle + " avatar"}
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
                    {getUsername(profile.bsky)}
                </span>
                {profile.bsky.displayName && <div className="text-[var(--text-light)]">
                    @{profile.bsky.handle}
                </div>}
            </div>
            <FollowButton handle={profile.bsky.handle} profile={profile.bsky}/>
        </div>

        <div className="ml-2 mb-2">
            <ProfileDescription description={profile.bsky.description}/>
        </div>

        <div className="flex flex-col items-start px-2 space-y-2 mb-1">

            <FollowCounters profile={profile}/>

            <div className="flex text-sm sm:text-base">
                {inCA ? <div
                        className="text-sm rounded-lg px-2 flex items-center justify-center py-1 bg-[var(--background-dark)] cursor-default space-x-1"
                        title="Nivel de permisos en la edición de temas. Hacé 10 ediciones para pasar de Editor aprendiz a Editor.">
                    <span className="text-[var(--text-light)]">
                        <ArticleIcon color={"inherit"}/>
                    </span>
                        <PermissionLevel
                            level={profile.ca.editorStatus}
                            className="text-[var(--text-light)] text-xs"
                        />
                    </div> :
                    <Link target={"_blank"} href={"https://bsky.app/profile/" + profile.bsky.handle}
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
