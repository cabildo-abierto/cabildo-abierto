import {useParams, useRouter} from "next/navigation";
import {Followx} from "@/components/profile/follow/followx";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";

export type FollowKind = "seguidores" | "siguiendo"


export const FollowxPage = ({kind}: {kind: FollowKind}) => {
    const {id} = useParams()
    const router = useRouter()

    if(!id || id instanceof Array){
        return null
    }

    function onSelection(v: string){
        router.push("/perfil/" + id + "/" + v)
    }

    return <div className={"pb-32"}>
        <div className={"flex flex-col items-start border-b border-[var(--accent-dark)] w-full"}>
            <SelectionComponent
                options={["seguidores", "siguiendo"]}
                selected={kind}
                onSelection={onSelection}
                optionsNodes={feedOptionNodes(40)}
                className={"flex justify-start"}
            />
        </div>
        {kind == "siguiendo" &&<Followx handle={id} kind={kind}/>}
        {kind == "seguidores" && <Followx handle={id} kind={kind}/>}
    </div>
}