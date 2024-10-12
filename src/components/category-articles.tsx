import { EntitySearchResult, getEntityChildrenCount } from "./entity-search-result"
import { useSearch } from "./search-context"
import { NoResults } from "./category-users"
import { SmallEntityProps } from "../app/lib/definitions"
import { useRouteEntities } from "../app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { cleanText, currentVersion, listOrderDesc, route2Text } from "./utils"
import InfoPanel from "./info-panel"
import { LazyLoadFeed } from "./lazy-load-feed"


function popularityScore(entity: SmallEntityProps){
    return [(entity.versions[currentVersion(entity)].numWords > 0 ? 1 : 0), getEntityChildrenCount(entity) + entity.uniqueViewsCount + entity._count.referencedBy + entity._count.reactions]
}


const ArticlesWithSearch = ({ entities, route }: { entities: SmallEntityProps[], route: string[] }) => {
    const { searchValue } = useSearch();

    function isMatch(entity: SmallEntityProps) {
        return cleanText(entity.name).includes(cleanText(searchValue));
    }

    let filteredEntities = searchValue.length > 0 ? entities.filter(isMatch) : entities;

    let entitiesWithScore = filteredEntities.map((entity) => ({ entity: entity, score: popularityScore(entity) }));
    entitiesWithScore = entitiesWithScore.sort(listOrderDesc);

    function generator(index: number){
        const entity = entitiesWithScore[index]?.entity;
        return {
            c: entity ? <EntitySearchResult route={route} entity={entity} /> : null,
            key: entity.id
        }
    }

    return (
        <div className="flex flex-col items-center w-full">
            {entitiesWithScore.length > 0 ? (
                <LazyLoadFeed maxSize={entitiesWithScore.length} generator={generator} />
            ) : (
                <NoResults text="No se encontró ningún artículo." />
            )}
        </div>
    );
};



export const CategoryArticles = ({route}: {route: string[]}) => {
    const routeEntities = useRouteEntities(route)
    const {searchValue} = useSearch()
    if(routeEntities.isLoading) return <LoadingSpinner/>

    const infoText = <span>Se suma la cantidad de comentarios, la cantidad de usuarios distintos que entraron y la cantidad de estrellas que recibió. Los artículos vacíos se muestran al final. Solo se muestran artículos de la categoría seleccionada ({route2Text(route)}).</span>

    return <>
        {searchValue.length == 0 && <div className="text-center mt-1 mb-2">
            <span className="text-[var(--text-light)] text-sm">Artículos ordenados por popularidad. <InfoPanel text={infoText}/></span>
        </div>}
        {routeEntities.entities.length > 0 ? 
            <ArticlesWithSearch
                entities={routeEntities.entities}
                route={route}
            />
             : 
        <div className="flex justify-center">
            No se encontraron artículos.
        </div>}
    </>
}