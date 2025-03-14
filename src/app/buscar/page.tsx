import SearchBar from "../../components/search/searchbar";
import {SearchContent} from "../../components/search/search-content";


const Page = async ({searchParams}: {searchParams: Promise<{q: string}>}) => {
    const {q} = await searchParams

    return <div>
        <div className={"p-3"}>
            <SearchBar autoFocus={true}/>
        </div>
        <div>
            <SearchContent query={q}/>
        </div>
    </div>
}


export default Page