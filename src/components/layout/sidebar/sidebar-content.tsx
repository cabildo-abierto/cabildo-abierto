
import {SidebarBottom} from "@/components/layout/sidebar/sidebar-bottom";
import { useLayoutConfig } from '../layout-config-context';
import {useSession} from "@/queries/getters/useSession";
import {SidebarButtons} from "@/components/layout/sidebar/sidebar-buttons";
import NextMeetingInvite from "@/components/layout/next-meeting-invite";
import { BaseButton } from '../base/baseButton';
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {SignInIcon} from "@phosphor-icons/react";
import { SidebarProfilePic } from "./sidebar-profile-pic";
import { BaseIconButton } from "../base/base-icon-button";
import {cn} from "@/lib/utils";



export const SidebarContent = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const user = useSession()
    const showText = layoutConfig.openSidebar
    const {setLoginModalOpen} = useLoginModal()

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
                            <SidebarProfilePic showText={showText}/>
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
                                onClick={() => {setLoginModalOpen(true)}}
                            >
                                Iniciar sesión
                            </BaseButton>}
                            {!showText && <BaseIconButton
                                className={"h-8"}
                                size={isMobile ? "default" : "small"}
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