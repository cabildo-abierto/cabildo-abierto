import { getTrending } from "@/actions/trending"


const TrendingTopic: React.FC<{value: string, count: number}> = ({value, count}) => {
    return <div className="py-2">
        <div className="font-bold">
            {value}
        </div>
        <div className="text-gray-600">
            {count} menciones
        </div>
    </div>
}

export const TrendingTopicsPanel = async () => {
    const trending = await getTrending(5)
    return <div className="flex justify-center w-full py-8 px-2">
        <div className="rounded border px-2 py-2">
            <h3 className="px-4">
                Tendencias
            </h3>
            <ul>
                {trending.map((word, index) => {
                    return <li key={index} className="">
                        <TrendingTopic value={word.word} count={word.count}/>
                    </li>
                })}
            </ul>
        </div>
    </div>
}
