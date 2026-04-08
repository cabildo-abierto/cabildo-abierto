import React, {useState} from "react";
import {SidebarBottom} from "./sidebar-bottom";
import {useSession} from "@/components/auth/use-session";
import {SidebarButtons} from "./sidebar-buttons";
import NextMeetingInvite from "../right-panel/next-meeting-invite";
import {useLoginModal} from "../../../auth/login-modal-provider";
import {SignInIcon} from "@phosphor-icons/react";
import { SidebarProfilePic } from "./sidebar-profile-pic";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {cn} from "@/lib/utils";
import {BaseButton} from "@/components/utils/base/base-button";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";
import {useIsMobile} from "@/components/utils/use-is-mobile";
import {usePathname} from "next/navigation";
import GettingStartedProgress, {
    CircularMissionProgress,
    useGettingStartedProgressData
} from "../right-panel/getting-started-progress";


export const SidebarContent = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const [guideOpen, setGuideOpen] = useState(false)
    const {isMobile} = useIsMobile()
    const {layoutState, setLayoutState} = useLayoutState()
    const user = useSession()
    const pathname = usePathname()
    const showText = layoutState.openSidebar
    const {setLoginModalOpen} = useLoginModal()
    const {goals, completedMissions, isLoading} = useGettingStartedProgressData()
    const pathnameSegments = pathname.split("/").filter(Boolean)
    const profileHandle = pathnameSegments[0] === "perfil" && pathnameSegments.length === 2
        ? decodeURIComponent(pathnameSegments[1])
        : null
    const showGettingStartedProgress = Boolean(
        showText
        && user.user && (
            pathname.includes("inicio")
            || profileHandle === user.user.handle
        )
    )
    const showGuideToggle = showGettingStartedProgress && !isLoading && goals.length > 0

    return (
        <>
            <div
                className={cn("pt-4 px-4 h-full", !showText && "hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div
                        className={"flex pb-8 h-full flex-col [@media(min-height:600px)]:space-y-2 [@media(min-height:520px)]:space-y-1 space-y-[2px]"}
                    >
                        {user.user && <div className={"space-y-2 mb-3 " + (showText ? "px-4" : "")}>
                            <div className={"flex items-start justify-between gap-2"}>
                                <SidebarProfilePic showText={showText}/>
                                {showGuideToggle && <CircularMissionProgress
                                    completed={completedMissions}
                                    total={goals.length}
                                    onClick={() => setGuideOpen(prev => !prev)}
                                />}
                            </div>
                            <div className={isMobile && showText ? "" : "hidden"}>
                                <div className={"font-bold [@media(min-height:600px)]:text-xl [@media(min-height:520px)]:text-lg text-base"}>
                                    {user.user.displayName ?? "@" + user.user.handle}
                                </div>
                                <div className={"text-[var(--text-light)] [@media(min-height:600px)]:text-lg [@media(min-height:520px)]:text-base text-sm"}>                                    {"@" + user.user.handle}
                                </div>
                            </div>
                        </div>}
                        {!user.user && <div className={"ml-[14px] pr-5"}>
                            {showText && <BaseButton
                                startIcon={<SignInIcon/>}
                                variant="outlined"
                                size={isMobile ? "default" : "small"}
                                className={"h-8"}
                                onClick={() => {
                                    setLoginModalOpen(true);
                                    if(isMobile) {
                                        setLayoutState({...layoutState, openSidebar: false})
                                    }
                                }}
                            >
                                Iniciar sesión
                            </BaseButton>}
                            {!showText && <BaseIconButton
                                className={"h-8"}
                                onClick={() => {setLoginModalOpen(true)}}
                            >
                                <SignInIcon/>
                            </BaseIconButton>}
                        </div>}
                        <SidebarButtons
                            showText={showText}
                            onClose={onClose}
                            setWritePanelOpen={setWritePanelOpen}
                        />
                        <NextMeetingInvite/>
                        {showGettingStartedProgress && guideOpen && <GettingStartedProgress/>}
                        {isMobile && <div className={"px-4 space-y-4 h-full"}>
                            <hr className={" border-[1px] border-[var(--text)]"}/>
                            <div className={"text-xs h-full"}>
                                <SidebarBottom/>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </>
    )
}
