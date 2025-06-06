import GradientHRule from "../../../modules/ui-utils/src/gradient-hrule";
import {useDonationHistory} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {DateSince} from "../../../modules/ui-utils/src/date";

type Donation = {
    date: Date
    amount: number
}

export type DonationHistory = Donation[]


export const DonationHistory = () => {
    const {data, isLoading} = useDonationHistory()

    const total = data ? data.reduce((acc, d) => acc + d.amount, 0) : undefined

    return <div className={"space-y-4 w-full flex flex-col items-center bg-[var(--background-dark)] rounded p-4 mx-2"}>
        <div className={"flex justify-between w-full"}>
            <h3 className={"w-full"}>Tus aportes</h3>
            {total != undefined && <div className={"flex justify-between rounded bg-[var(--background-dark2)] p-2 text-sm text-center space-x-4"}>
                <div>
                    Total
                </div>
                <div>
                    ${total}
                </div>
            </div>}
        </div>
        <div className={"w-full"}>
            <GradientHRule/>
        </div>
        <div>
            {isLoading && <div className={"py-4"}>
                <LoadingSpinner/>
            </div>}
            {!data && <div className={"text-sm text-[var(--text-light)] text-center"}>
                Ocurrió un error al cargar los datos.
            </div>}
            {data && <div>
                {data.map((d, index) => {
                    return <div key={index}>
                        <div>
                            {d.amount}
                        </div>
                        <div>
                            <DateSince date={d.date} />
                        </div>
                    </div>
                })}
            </div>}
            {data && data.length == 0 && <div className={"text-sm text-[var(--text-light)] text-center"}>
                Acá va a aparecer tu primer aporte.
            </div>}
        </div>
    </div>
}