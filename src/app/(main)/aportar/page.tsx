"use client"

import {ThreadHeader} from "@/components/thread/thread-header";
import FundingProgress from "@/components/aportar/funding-progress";
import {Button} from "@/../modules/ui-utils/src/button"
import DonateIcon from "@/components/icons/donate-icon";
import {DonationHistory} from "@/components/aportar/donation-history";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";


export default function Aportar() {
    return <div className={"space-y-2 flex flex-col items-center pb-16"}>
        <ThreadHeader title={"Aportar"}/>
        <div className={"px-5 py-10 sm:p-10 rounded-lg bg-[var(--background-dark)] flex flex-col items-center space-y-8"}>
            <div className={"pb-12 pt-8 text-base text-center text-[var(--text-light)]"}>
                Con tu aporte se financia el equipo que trabaja en la plataforma y los autores de los contenidos que
                leés.
            </div>
            <div className={"w-full flex justify-center"}>
                <FundingProgress/>
            </div>
            <div className={""}>
                <Link href={"/aportar/elegir-aporte"}>
                    <Button size={"large"} startIcon={<DonateIcon/>}>
                        <span className={"font-semibold"}>Aportar</span>
                    </Button>
                </Link>
            </div>
            <div className={"flex space-y-2 text-sm flex-col items-center text-center text-[var(--text-light)] max-w-[400px] pt-8 px-4"}>
                <Link
                    href={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}
                    className={"hover:text-[var(--text)] transform duration-200"}
                >
                    ¿Cómo se remunera a los autores?
                </Link>
                <Link
                    href={"/equipo"}
                    className={"hover:text-[var(--text)] transform duration-200"}
                >
                    ¿Cómo se define el objetivo de financiamiento?
                </Link>
                <Link
                    href={"/equipo"}
                    className={"hover:text-[var(--text)] transform duration-200"}
                >
                    ¿Quiénes hacemos Cabildo Abierto?
                </Link>
            </div>
            <DonationHistory/>
        </div>
    </div>
}