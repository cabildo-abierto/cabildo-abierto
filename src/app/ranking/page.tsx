import {getUsersWithStats} from "../../actions/actions";
import {UserStats} from "../lib/definitions";
import {UserScoreboard} from "../../components/users-scoreboard";
import {ThreeColumnsLayout} from "../../components/three-columns";


const Page = async () => {
    let usersWithStats = await getUsersWithStats();

    function compChars(a: {stats: UserStats}, b: {stats: UserStats}){
        return b.stats.entityAddedChars - a.stats.entityAddedChars;
    }

    usersWithStats.sort(compChars)

    const center = <div className="flex items-center flex-col">
        <h2 className="mt-8 mb-4">Editores con más caracteres escritos</h2>
        <UserScoreboard users={usersWithStats.slice(0, 10)}/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Page