import { useSearch } from "./search-context";
import {
    APIResult,
    ArCabildoabiertoActorDefs,
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion,
    MainSearchOutput,
    SearchOption
} from "@cabildo-abierto/api";
import { LoadingSpinner } from "@/components/utils/base/loading-spinner";
import { usePathname } from "next/navigation";
import { useDebounce } from "@/components/utils/react/debounce";
import FeedElement from "@/components/feed/feed/feed-element";
import { FeedEndText } from "@/components/feed/feed/feed-end-text";
import { useQuery } from "@tanstack/react-query";
import { Note } from "../utils/base/note";
import UserSearchResult from "@/components/buscar/user-search-result";


export function SearchResults(
    {search, kind}: {search: (q: string, kind: SearchOption) => Promise<APIResult<MainSearchOutput>>, kind: SearchOption},
) {
    const pathname = usePathname();
    const { searchState } = useSearch(`${pathname}::main`);
    const debouncedValue = useDebounce(searchState.value, 300);

    const { data, isLoading } = useQuery({
        queryKey: ['search', kind, debouncedValue],
        queryFn: () => search(debouncedValue, kind),
        enabled: debouncedValue.length > 0
    });

    if (debouncedValue.length === 0) {
        return (
            <Note className={"pt-16 text-[var(--text-light)]"}>
                {kind == "Publicaciones" && "Buscá en publicaciones de usuarios de Cabildo Abierto."}
                {kind == "Artículos" && "Buscá en artículos."}
                {kind == "Temas" && "Buscá temas por título o contenido."}
                {kind == "Usuarios" && "Buscá usuarios."}
            </Note>
        );
    }

    if (isLoading) {
        return (
            <div className={"pt-32"}>
                <LoadingSpinner />
            </div>
        )
    }

    if(!data) {
        return <div className={"pt-32"}>
            <Note>
                Ocurrió un error al buscar.
            </Note>
        </div>
    }

    if (data && data.success === true) {
        const results = data.value.value.feed
        return (
            <div>
                {results.map(r => {
                    if (
                        ArCabildoabiertoFeedDefs.isPostView(r.content) ||
                        ArCabildoabiertoFeedDefs.isArticleView(r.content)
                    ) {
                        return <FeedElement key={r.content.uri} elem={r} />;
                    } else if (
                        ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(r.content)
                    ) {
                        const key = r.content.versionRef ? r.content.versionRef.uri : r.content.id
                        return <FeedElement key={key} elem={r} />;
                    } else if(ArCabildoabiertoActorDefs.isProfileView(r)) {
                        return <UserSearchResult user={r} key={r.did}/>
                    }
                })}
                {results.length === 0 && <FeedEndText text={"No se encontraron resultados."} />}
                {results.length > 0 && <FeedEndText text={"No tenemos más resultados para mostrarte."} />}
            </div>
        );
    } else {
        return <Note className={"pt-16 text-[var(--text-light)]"}>
            Ocurrió un error al buscar.
        </Note>
    }
}