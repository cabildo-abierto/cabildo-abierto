import {CustomLink as Link} from '../../../../modules/ui-utils/src/custom-link';
import {ProfilePic} from "../../profile/profile-pic";
import {profileUrl} from "@/utils/uri";
import {dimOnHoverClassName} from "../../../../modules/ui-utils/src/dim-on-hover-link";
import {SidebarBottom} from "@/components/layout/sidebar/sidebar-bottom";
import { useLayoutConfig } from '../layout-config-context';
import VerifyAccountButton from '@/components/profile/verify-account-button';
import {useSession} from "@/queries/useSession";
import {SidebarButtons} from "@/components/layout/sidebar/sidebar-buttons";
import NextMeetingInvite from "@/components/layout/next-meeting-invite";




export const SidebarContent = ({onClose, setWritePanelOpen}: {
    onClose: () => void
    setWritePanelOpen: (open: boolean) => void
}) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const user = useSession()
    const showText = layoutConfig.openSidebar

    return (
        <>
            <div
                className={"pt-4 px-2 overflow-scroll no-scrollbar h-full " + (showText ? "" : "hidden min-[500px]:block")}
            >
                <div className={"h-full flex flex-col justify-between"}>
                    <div
                        className={"flex pb-8 h-full flex-col" + (isMobile ? " space-y-3" : " space-y-2")}
                    >
                        <div className={"mt-4 mb-2 space-y-2 " + (showText ? "px-4" : "")}>
                            <div className={"flex w-full"}>
                                <div className={"flex flex-col items-center space-y-1 " + (!showText ? "pl-4 min-h-12 justify-end" : "")}>
                                    <Link href={profileUrl(user.user.handle)} id={"sidebar-profile-pic"}>
                                        <ProfilePic
                                            clickable={false}
                                            user={user.user}
                                            className={"rounded-full border " + dimOnHoverClassName + (isMobile ? " w-14 h-14" : showText ? " w-12 h-12" : " w-7 h-7")}
                                            descriptionOnHover={false}
                                        />
                                    </Link>
                                    <VerifyAccountButton verification={user.user.validation}/>
                                </div>
                            </div>
                            <div className={isMobile && showText ? "" : "hidden"}>
                                <div className={"font-bold text-xl"}>
                                    {user.user.displayName ?? "@" + user.user.handle}
                                </div>
                                <div className={"text-[var(--text-light)] text-lg"}>
                                    {"@" + user.user.handle}
                                </div>
                                <hr className={"mt-4 border-[1px] border-[var(--text)]"}/>
                            </div>
                        </div>
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
                    {/*<div className={"text-[var(--text-light)] flex justify-end mb-2 max-[500px]:hidden"}>
                        <IconButton
                            size={"small"}
                            color={"transparent"}
                            onClick={() => {
                                setShowText(!showText)
                            }}
                        >
                            {showText ? <KeyboardDoubleArrowLeftIcon/> : <KeyboardDoubleArrowRightIcon/>}
                        </IconButton>
                    </div>*/}
                </div>
            </div>
        </>
    )
}