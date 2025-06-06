"use client"

import {ThreadHeader} from "@/components/thread/thread-header";
import FundingProgress from "@/components/aportar/funding-progress";
import {Button} from "@/../modules/ui-utils/src/button"
import DonateIcon from "@/components/icons/donate-icon";
import {DonationHistory} from "@/components/aportar/donation-history";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";


export default function Aportar() {
    const p = 75
    return <div className={"space-y-2 flex flex-col items-center"}>
        <ThreadHeader title={"Aportar"}/>
        <div className={"text-center text-[var(--text-light)] max-w-[400px] pt-8 px-4 sm:text-base text-sm"}>
            Con tu aporte se financia el equipo que trabaja en la plataforma y los autores que consumís.
        </div>
        <Link
            className="link2 sm:text-sm text-xs text-[var(--text-light)] "
            href={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}>Más información
        </Link>
        <div className={"pt-8"}>
            <Link href={"/aportar/elegir-aporte"}>
                <Button size={"large"} startIcon={<DonateIcon/>}>
                    <span className={"font-semibold"}>Aportar</span>
                </Button>
            </Link>
        </div>
        <div className={"w-full pt-8 flex justify-center max-w-[500px]"}>
            <FundingProgress p={p}/>
        </div>
        <div className={"w-full pt-8 flex justify-center max-w-[500px]"}>
            <DonationHistory/>
        </div>
    </div>
}