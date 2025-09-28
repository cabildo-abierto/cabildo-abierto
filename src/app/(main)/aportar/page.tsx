"use client"

import FundingProgress from "@/components/aportar/funding-progress";
import {Button} from "@/../modules/ui-utils/src/button"
import DonateIcon from "@/components/layout/icons/donate-icon";
import {DonationHistory} from "@/components/aportar/donation-history";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import {ArrowRightIcon} from "@phosphor-icons/react";
import {ReactNode} from "react";


const ListItem = ({children, href}: { href: string, children: ReactNode }) => {
    return <li>
        <Link
            className={"flex space-x-2 items-center font-light hover:text-[var(--text)] transform duration-200"}
            href={href}
        >
            <ArrowRightIcon size={14} weight="light"/>
            <div>
                {children}
            </div>
        </Link>
    </li>
}


export default function Aportar() {
    return <div
        className={"space-y-2 flex flex-col items-center pb-8 font-light pt-16 bg-[var(--background-dark)] rounded-lg mt-4 mb-4"}>
        <div className={"mx-2 px-5 flex flex-col space-y-16"}>
            <div className={"font-light text-base text-[var(--text-light)]"}>
                Con tu aporte se financia el equipo que trabaja en la plataforma y los autores de los contenidos que
                leés.
            </div>
            <div className={"w-full flex justify-center"}>
                <FundingProgress/>
            </div>
            <div className={"w-full flex justify-center"}>
                <Link href={"/aportar/elegir-aporte"}>
                    <Button
                        variant="outlined"
                        paddingX={"24px"}
                        paddingY={"12px"}
                        sx={{borderRadius: "4px"}}
                        color={"background-dark2"}
                        size={"large"}
                        startIcon={<DonateIcon/>}
                    >
                        <span className={"font-semibold"}>Aportar</span>
                    </Button>
                </Link>
            </div>
            <div className={"flex space-y-2 flex-col text-[var(--text-light)] max-w-[400px]"}>
                <ul className={"list-none"}>
                    <ListItem href={topicUrl("Cabildo Abierto: Financiamiento", undefined, "normal")}>
                        ¿Cómo se define el objetivo de financiamiento?
                    </ListItem>
                    <ListItem href={topicUrl("Cabildo Abierto: Remuneraciones", undefined, "normal")}>
                        ¿Cómo se remunera a los autores?
                    </ListItem>
                    <ListItem href={"/equipo"}>
                        ¿Quiénes hacemos Cabildo Abierto?
                    </ListItem>
                </ul>
            </div>
            <DonationHistory/>
        </div>
    </div>
}