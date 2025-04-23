import { StatsIcon } from "@/components/icons/stats-icon"
import { StatsPanel } from "@/components/ajustes/stats-panel";
import {UserStats} from "@/lib/types";




const Page = async () => {
    //const stats = await getUserStats()

    return <div className="mt-8 flex flex-col items-center px-4">
        <h2 className="mb-8">
            Tus estadísticas <StatsIcon/>
        </h2>
        {/*TO DO <div className="bg-[var(--background-dark)] shadow rounded-lg p-4 w-full mb-8">
            <StatsPanel stats={stats}/>
        </div>*/}
    </div>
}

export default Page