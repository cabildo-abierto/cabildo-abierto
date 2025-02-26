import SearchBar from "../../components/searchbar";
import {SearchContent} from "../../components/search-content";


const Page = async ({searchParams}: {searchParams: {q: string}}) => {


    return <div>
        <div className={"p-3"}>
            <SearchBar className={"h-10"} autoFocus={true}/>
        </div>
        <div>
            <SearchContent query={searchParams.q}/>
        </div>
    </div>
}


export default Page