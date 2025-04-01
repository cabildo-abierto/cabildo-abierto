import SearchBar from "@/components/buscar/searchbar";
import {SearchContent} from "@/components/buscar/search-content";
import {SmallBackButtonHeader} from "../../components/layout/small-back-button-header";


const Page = async ({searchParams}: {searchParams: Promise<{q: string}>}) => {
    const {q} = await searchParams

    return <div className={"flex flex-col items-center"}>
        <div className={"min-[500px]:hidden w-full px-2"}>
            <SmallBackButtonHeader title={"Buscar"}/>
        </div>
        <div className={"p-2 w-full max-w-[560px]"}>
            <SearchBar autoFocus={true} fullWidth={true}/>
        </div>
        <div className={"w-full"}>
            <SearchContent query={q}/>
        </div>
    </div>
}


export default Page