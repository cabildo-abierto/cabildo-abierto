
import {SidebarBottom} from "@/components/layout/sidebar/sidebar-bottom";
import { useLayoutConfig } from '../layout-config-context';
import {useSession} from "@/queries/getters/useSession";
import {SidebarButtons} from "@/components/layout/sidebar/sidebar-buttons";
import NextMeetingInvite from "@/components/layout/next-meeting-invite";
import { Button } from '../utils/button';
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {SignInIcon} from "@phosphor-icons/react";
import { SidebarProfilePic } from "./sidebar-profile-pic";
import { IconButton } from "../utils/icon-button";



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
                className={"pt-4 px-2 overflow-scroll no-scrollbar h-full " + (showText ? "" : "hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div
                        className={"flex pb-8 h-full flex-col" + (isMobile ? " space-y-2" : " space-y-2")}
                    >
                        {user.user && <div className={"mt-4 mb-2 space-y-2 " + (showText ? "px-4" : "")}>
                            <SidebarProfilePic showText={showText}/>
                            <div className={isMobile && showText ? "" : "hidden"}>
                                <div className={"font-bold text-xl"}>
                                    {user.user.displayName ?? "@" + user.user.handle}
                                </div>
                                <div className={"text-[var(--text-light)] text-lg"}>
                                    {"@" + user.user.handle}
                                </div>
                            </div>
                        </div>}
                        {!user.user && <div className={"ml-[14px] pr-5"}>
                            {showText && <Button
                                startIcon={<SignInIcon/>}
                                variant="outlined"
                                size={isMobile ? "medium" : "small"}
                                fullWidth={true}
                                style={{height: "32px"}}
                                onClick={() => {setLoginModalOpen(true)}}
                            >
                                Iniciar sesión
                            </Button>}
                            {!showText && <IconButton
                                color={"background-dark"}
                                sx={{
                                    borderRadius: 0,
                                    border: "1px solid var(--accent-dark)",
                                    height: "32px"
                                }}
                                size={isMobile ? "medium" : "small"}
                                onClick={() => {setLoginModalOpen(true)}}
                            >
                                <SignInIcon/>
                            </IconButton>}
                        </div>}
                        <SidebarButtons
                            showText={showText}
                            onClose={onClose}
                            setWritePanelOpen={setWritePanelOpen}
                        />
                        <NextMeetingInvite/>
                        <div className={"px-4 space-y-4 h-full"}>
                            <hr className={"sm:hidden border-[1px] border-[var(--text)]"}/>
                            {showText && <div className={"sm:hidden text-xs h-full"}>
                                <SidebarBottom/>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}