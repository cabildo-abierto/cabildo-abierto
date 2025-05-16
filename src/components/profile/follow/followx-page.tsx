import {useParams, useRouter} from "next/navigation";
import {Followx} from "@/components/profile/follow/followx";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {optionToSearchParam} from "@/components/inicio/main-page";
import Link from "next/link";
import { Button } from "../../../../modules/ui-utils/src/button";

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

    function optionsNodes(o: string, isSelected: boolean){
        const id = optionToSearchParam(o)

        return <div className="text-[var(--text)] h-10" id={id}>
            <Button
                onClick={() => {}}
                variant="text"
                color="transparent"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0,
                }}
            >
                <div className={"capitalize whitespace-nowrap min-[500px]:mx-4 pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div>
        <div className={"flex flex-col items-start border-b w-full"}>
            <div className={"flex space-x-2 py-2 items-center"}>
                <BackButton/>
                <Link href={"/src/app/(main)/perfil/" + id} className={"font-semibold text-lg"}>
                    @{id}
                </Link>
            </div>
            <SelectionComponent
                options={["seguidores", "siguiendo"]}
                selected={kind}
                onSelection={onSelection}
                optionsNodes={optionsNodes}
                className={"flex justify-start"}
            />
        </div>
        {kind == "siguiendo" && <Followx handle={id} kind={kind}/>}
        {kind == "seguidores" && <Followx handle={id} kind={kind}/>}
    </div>
}