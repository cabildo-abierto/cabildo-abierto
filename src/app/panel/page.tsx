import { StatsIcon } from "../../components/icons/stats-icon"
import {getUserStats} from "../../actions/users";
import { StatsPanel } from "../../components/ajustes/stats-panel";


const Page = async () => {
    const stats = await getUserStats()

    const center = <div className="mt-8 flex flex-col items-center px-4">
        <h2 className="mb-8">
            Tus estadísticas <StatsIcon/>
        </h2>
        <div className="bg-[var(--background-dark)] shadow rounded-lg p-4 w-full mb-8">
            <StatsPanel stats={stats.stats}/>
        </div>
    </div>

    return center
}

export default Page