import EnDiscusionIcon from "@/components/layout/icons/en-discusion-icon";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, isArticle, isPost} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";import {DropdownMenuItem} from "@/components/ui/dropdown-menu";


export function canBeEnDiscusion(c: string) {
    return isPost(c) || isArticle(c)
}


export const OptionsEnDiscusionButton = ({uri, enDiscusion, onClick}: {
    uri: string
    enDiscusion: boolean
    onClick: () => void
}) => {
    const {user} = useSession()
    const authorDid = getDidFromUri(uri)
    const isAuthor = user && user.did == authorDid
    const isOptimistic = getRkeyFromUri(uri).startsWith("optimistic")
    const collection = getCollectionFromUri(uri)

    if (!isAuthor || !canBeEnDiscusion(collection)) return null

    return <>
        <DropdownMenuItem disabled={isOptimistic} onSelect={onClick}>
            <div>
                <EnDiscusionIcon fontSize={20}/>
            </div>
            <div>
                {enDiscusion ? "Retirar de En discusión" : "Agregar a En discusión"}
            </div>
        </DropdownMenuItem>
    </>
}