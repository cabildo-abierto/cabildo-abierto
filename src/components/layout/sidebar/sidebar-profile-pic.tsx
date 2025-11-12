import {CustomLink as Link} from '../utils/custom-link';
import {ProfilePic} from "../../profile/profile-pic";
import {profileUrl} from "@/utils/uri";
import {dimOnHoverClassName} from "../utils/dim-on-hover-link";
import VerifyAccountButton, {isVerified} from '@/components/profile/verify-account-button';
import {useSession} from '@/queries/getters/useSession';
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {HourglassIcon, WarningIcon} from '@phosphor-icons/react';
import DescriptionOnHover from "../utils/description-on-hover";
import {post} from "@/utils/fetch";


export const SidebarProfilePic = ({showText}) => {
    const {isMobile} = useLayoutConfig()
    const {user} = useSession(
        undefined,
        "sidebar-session",
        q => {
            const data = q.state.data
            if (data && data.mirrorStatus == "Sync") {
                return false
            } else {
                return 10000
            }
        })

    if (!user) return null

    const failedDescription = <div>
        <span>
            Falló la carga de los datos de tu cuenta.
        </span> <span
            className={"underline cursor-pointer"}
            onClick={async () => {
                await post("/sync")
            }}
        >
            Reintentar
        </span>
    </div>

    return <div className={"flex w-full"}>
        <div
            className={(!showText ? "pl-4 min-h-12 justify-end " : " relative ") + (isMobile ? "flex space-x-2 items-end" : "flex flex-col space-y-1 h-16 items-center")}>
            {showText && user.mirrorStatus != "Sync" && <div className={"absolute top-0 right-0 "}>
                {user.mirrorStatus == "InProcess" && <DescriptionOnHover
                    description={"Estamos cargando los datos de tu cuenta. Puede que algunas funcionalidades no funcionen hasta que esto termine. Si tarda demasiado, escribinos."}>
                    <HourglassIcon className={"cursor-pointer"} fontSize={"12"} color={"var(--text-light)"}/>
                </DescriptionOnHover>}
                {(user.mirrorStatus == "Failed" || user.mirrorStatus == "Failed - Too Large") &&
                    <DescriptionOnHover description={failedDescription}>
                        <WarningIcon className={"cursor-pointer"} fontSize={"12"} color={"var(--text-light)"}/>
                    </DescriptionOnHover>}
                {user.mirrorStatus == "Dirty" &&
                    <DescriptionOnHover description={"Los datos de tu cuenta todavía no se procesaron."}>
                        <WarningIcon className={"cursor-pointer"} fontSize={"12"} color={"var(--text-light)"}/>
                    </DescriptionOnHover>}
            </div>}
            <Link href={profileUrl(user.handle)} id={"sidebar-profile-pic"}>
                <ProfilePic
                    user={user}
                    className={"rounded-full " + dimOnHoverClassName + (isMobile ? " w-14 h-14" : showText ? " w-12 h-12" : " w-7 h-7")}
                    descriptionOnHover={false}
                />
            </Link>
            {(showText && !isVerified(user.validation) ?
                <div className={"h-4"}>
                    <VerifyAccountButton verification={user.validation}/></div> :
                <div className={"h-4"}/>)}
        </div>
    </div>
}