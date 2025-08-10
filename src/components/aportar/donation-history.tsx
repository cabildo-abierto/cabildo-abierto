import GradientHRule from "../../../modules/ui-utils/src/gradient-hrule";
import {useDonationHistory} from "@/queries/useFunding";
import {formatIsoDate} from "@/utils/dates";

type Donation = {
    date: Date
    amount: number
}

export type DonationHistory = Donation[]


export const DonationHistory = () => {
    const {data, isLoading} = useDonationHistory()

    if(!data || data.length == 0) return null

    return <div className={"space-y-4 w-full flex flex-col items-center bg-[var(--background-dark)] rounded p-4 mx-2"}>
        <h3 className={"w-full"}>Tus aportes</h3>
        <div className={"w-full"}>
            <GradientHRule/>
        </div>
        <div className={"w-full"}>
            {data && <div className={"flex flex-col w-full space-y-4 text-[var(--text-light)]"}>
                {data.map((d, index) => {
                    return <span className="" key={index}>
                        <span> ${d.amount}, {formatIsoDate(d.date)}.</span>
                    </span>
                })}
            </div>}
            {!data && !isLoading && <div className={"text-sm text-[var(--text-light)] text-center"}>
                Ocurrió un error al cargar los datos.
            </div>}
            {isLoading && <div className={"text-sm text-[var(--text-light)] text-center"}>
                Cargando aportes...
            </div>}
            {data && data.length == 0 && <div className={"text-sm text-[var(--text-light)] text-center"}>
                Acá va a aparecer tu primer aporte.
            </div>}
        </div>
    </div>
}