"use client"

import FundingProgress from "@/components/aportar/funding-progress";
import {BaseButton} from "@/components/layout/base/baseButton"
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
        className={"space-y-2 flex flex-col items-center pb-8 font-light pt-16 panel-dark group portal mt-4 mb-4"}
    >
        <div className={"mx-2 px-5 flex flex-col space-y-8"}>
            <div className={"font-light text-base text-[var(--text-light)]"}>
                Con tu aporte se financian los servidores, el equipo que trabaja en la plataforma y los autores de
                artículos y ediciones de la wiki.
            </div>
            <div className={"w-full flex justify-center"}>
                <FundingProgress/>
            </div>
            <div className={"w-full flex justify-center"}>
                <Link href={"/aportar/elegir-aporte"}>
                    <BaseButton
                        variant="outlined"
                        className={"px-6 py-3 rounded-[4px] font-semibold"}
                        size={"large"}
                        startIcon={<DonateIcon/>}
                    >
                        Aportar
                    </BaseButton>
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
        </div>
        <DonationHistory/>
    </div>
}