"use client"

import FundingProgress from "@/components/aportar/funding-progress";
import {BaseButton} from "@/components/utils/base/base-button";
import DonateIcon from "@/components/utils/icons/donate-icon";
import {DonationHistory} from "@/components/aportar/donation-history";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {cn} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/utils/ui/accordion";
import {useMonthlyValue} from "@/queries/getters/useFunding";
import {Note} from "@/components/utils/base/note";


export default function Aportar() {
    const {isMobile} = useLayoutConfig()
    const {data: value} = useMonthlyValue()
    return <div
        className={cn("space-y-2 flex flex-col items-center pb-8 font-light pt-16 panel-dark group portal mt-4 mb-32", isMobile && "mx-2 w-auto")}
    >
        <div className={"mx-2 px-5 flex flex-col space-y-8"}>
            <Note>
                Con tu aporte se financian los servidores, el equipo que trabaja en la plataforma y los autores de artículos y ediciones de la wiki.
            </Note>
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
            <div>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className={"font-light"}>
                            ¿Cómo se define el objetivo de financiamiento?
                        </AccordionTrigger>
                        <AccordionContent>
                            Se define en base a la cantidad de usuarios verificados activos. El valor total es <span
                            className={"font-mono"}>Usuarios verificados activos x ${value} x 6</span>, para tener 6
                            meses de margen. <Link
                            href={topicUrl("Cabildo Abierto: Financiamiento")}>
                            Más información
                        </Link>.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className={"font-light"}>
                            ¿Cómo se remunera a los autores?
                        </AccordionTrigger>
                        <AccordionContent>
                            La remuneración a los autores se calcula automáticamente en base a las lecturas que reciben
                            en sus artículos y ediciones se temas. Se considera la duración de la lectura y la cantidad
                            de texto leído. Por cada lector verificado se distribuyen ${value} entre sus lecturas. <Link
                            href={topicUrl("Cabildo Abierto: Remuneraciones")}>
                            Más información.
                        </Link>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className={"font-light"}>
                            ¿Quiénes hacen Cabildo Abierto?
                        </AccordionTrigger>
                        <AccordionContent>
                            El equipo está conformado actualmente por 3 personas y algunos colaboradores. <Link href={"/equipo"}>Más información.</Link>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>
        </div>
        <DonationHistory/>
    </div>
}