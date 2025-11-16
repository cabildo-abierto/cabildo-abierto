import {useDonationHistory} from "@/queries/getters/useFunding";
import {formatIsoDate} from "@cabildo-abierto/utils/dist/dates";

type Donation = {
    date: Date
    amount: number
}

export type DonationHistory = Donation[]


export const DonationHistory = () => {
    let {data, isLoading} = useDonationHistory()

    if (!data || data.length == 0) return null


    return <>
        <div className={"px-8 w-full"}>
            <hr className={"bg-[var(--accent-dark)] w-full"}/>
        </div>
        <div
            className={"space-y-4 w-full justify-center px-8 flex flex-col items-center rounded p-4"}
        >
            <h3 className={"w-full uppercase text-base"}>Tus aportes</h3>
            <div className={"w-full"}>
                {data && <div className={"flex flex-col w-full space-y-4 text-[var(--text-light)]"}>
                    {data.map((d, index) => {
                        return <div
                            className="flex justify-between"
                            key={index}
                        >
                            <div className={"font-semibold"}>${d.amount}</div>
                            <div>{formatIsoDate(d.date)}</div>
                        </div>
                    })}
                </div>}
                {!data && !isLoading && <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Ocurrió un error al cargar los datos.
                </div>}
                {isLoading && <div className={"text-sm text-[var(--text-light)] text-center"}>
                    Cargando aportes...
                </div>}
                {data && data.length == 0 && <div
                    className={"text-sm text-[var(--text-light)] text-center"}
                >
                    Acá va a aparecer tu primer aporte.
                </div>}
            </div>
        </div>
    </>
}