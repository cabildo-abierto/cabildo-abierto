import React from "react";
import FeedViewContentFeed from "./feed-view-content-feed";
import {useSession} from "@/components/auth/use-session";
import {LoginRequiredPage} from "../../layout/main-layout/page-requires-login-checker";
import {BaseButton} from "@/components/utils/base/base-button";
import Link from "next/link";
import {Note} from "@/components/utils/base/note";
import {CaretDownIcon} from "@phosphor-icons/react";
import {useGetFeed} from "@/components/feed/feed/get-feed";
import {chronologicalFeedMerger} from "@/components/feed/feed/feed-merger";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";


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

    if (error == "auth required") {
        return <LoginRequiredPage text={"Iniciá sesión para ver este muro."}/>
    } else if (error == "custom feed uri required" || error == "topic id required" || !config) {
        return <Note className={"py-16"}>
            Muro inválido.
        </Note>
    }

    const noResultsText = config.subtype == "siguiendo" ? followingFeedNoResultsText : config.subtype == "descubrir" ? discoverFeedNoResultsText : config.subtype == "discusion" ? "No hay contenidos en discusión" : "No se encontraron resultados."

    const feedMerger = config.subtype == "siguiendo" ? chronologicalFeedMerger : undefined

    return <div className="w-full">
        {(config.subtype == "discusion" || user) && <FeedViewContentFeed
            getFeed={getFeed(config)}
            noResultsText={noResultsText}
            endText={"Fin del muro."}
            queryKey={["feed", JSON.stringify(config)]}
            feedMerger={feedMerger}
        />}
    </div>
}