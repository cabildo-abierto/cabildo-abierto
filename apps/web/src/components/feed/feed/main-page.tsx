import React from "react";
import FeedViewContentFeed from "./feed-view-content-feed";
import {useSession} from "@/components/auth/use-session";
import {LoginRequiredPage} from "../../layout/main-layout/page-requires-login-checker";
import {BaseButton} from "@/components/utils/base/base-button";
import Link from "next/link";
import {Note} from "@/components/utils/base/note";
import {ArrowSquareOutIcon, CaretDownIcon} from "@phosphor-icons/react";
import {useGetFeed} from "@/components/feed/feed/get-feed";
import {chronologicalFeedMerger, defaultFeedViewContentFeedMerger} from "@/components/feed/feed/feed-merger";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {topicUrl} from "@/components/utils/react/url";


const followingFeedNoResultsText = <div
    className="flex flex-col items-center space-y-8 text-base text-[var(--text-light)]"
>
    <div>
        No se encontraron contenidos.
    </div>
    <Link href={"/buscar?s=Usuarios"}>
        <BaseButton variant="outlined" size={"small"}>
            Buscar usuarios
        </BaseButton>
    </Link>
</div>

const discoverFeedNoResultsText = <div>
    <Note className={""}>
        No se encontraron contenidos.
    </Note>
    <Note>
        Configurá tus intereses tocando la flechita de arriba (<CaretDownIcon
        className={"inline-block"}/>)
    </Note>
</div>


export const MainPage = () => {
    const {user} = useSession()
    const {getFeed} = useGetFeed()
    const {config, error} = useMainPageFeeds()
    const {layoutConfig} = useLayoutConfig()

    if (error == "auth required") {
        return <LoginRequiredPage text={"Iniciá sesión para ver este muro."}/>
    } else if (error == "custom feed uri required" || error == "topic id required") {
        return <Note className={"py-16"}>
            Muro inválido.
        </Note>
    } else if (!config) {
        return <div className={"flex flex-col items-center py-16 space-y-4"}>
            <Note className={""}>
                Agregá al menos un muro a tu pantalla principal
            </Note>
            <div>
                <Link href={"/inicio/muros"}>
                    <BaseButton variant={"outlined"} size={"small"}>
                        Explorar muros
                    </BaseButton>
                </Link>
            </div>
        </div>
    }

    const noResultsText = config.subtype == "siguiendo" ? followingFeedNoResultsText : config.subtype == "descubrir" ? discoverFeedNoResultsText : config.subtype == "discusion" ? "No hay contenidos en discusión" : "No se encontraron resultados."

    const feedMerger = config.subtype == "siguiendo" || config.subtype == "descubrir" || config.subtype == "mentions" && config.metric == "Recientes" || config.subtype == "discusion" && config.metric == "Recientes" ? chronologicalFeedMerger : defaultFeedViewContentFeedMerger

    return <div className="w-full">
        {config.type == "topic" &&
            <Link
                href={topicUrl(config.id)}
                className={"px-4 bg-[var(--background)]  opacity-90 backdrop-blur z-[800] font-light flex items-center fixed h-12  hover:bg-[var(--background-dark)] normal-case space-x-3 text-sm cursor-pointer"}
                style={{width: layoutConfig.centerWidth}}
            >
                <ArrowSquareOutIcon fontSize={15}/>
                <div>
                    <span>Ir al tema</span> <span
                    className="text-[var(--text-light)] font-semibold">{config.title}</span>
                </div>
            </Link>}
        {(config.subtype == "discusion" || user) &&
            <div className={config.type == "topic" ? "pt-12" : ""}>
                <FeedViewContentFeed
                    getFeed={getFeed(config)}
                    noResultsText={noResultsText}
                    endText={"Fin del muro."}
                    queryKey={["main-feed", config.subtype, JSON.stringify(config)]}
                    feedMerger={feedMerger}
                />
            </div>}
    </div>
}