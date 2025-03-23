import SearchBar from "../../components/search/searchbar";
import {SearchContent} from "../../components/search/search-content";


const Page = async ({searchParams}: {searchParams: Promise<{q: string}>}) => {
    const {q} = await searchParams

    return <div className={"flex flex-col items-center"}>
        <div className={"p-2 w-full max-w-[560px]"}>
            <SearchBar autoFocus={true} fullWidth={true}/>
        </div>
        <div className={"w-full"}>
            <SearchContent query={q}/>
        </div>
    </div>
}


export default Page