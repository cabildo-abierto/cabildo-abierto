import React from 'react';
import InfoPanel from '../../../modules/ui-utils/src/info-panel';
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import {topicUrl} from "@/utils/uri";
import {useMonthlyValue} from "@/queries/api";

const FundingProgress = ({p}: { p: number }) => {
    const state = p === 100 ? 'good' : p >= 90 ? 'medium' : 'bad';
    const progressColor = state === "good" ? 'bg-green-500' : state === "medium" ? 'bg-yellow-500' : 'bg-red-500';
    const { data: value } = useMonthlyValue();

    return (
        <div className={"space-y-2 w-full bg-[var(--background-dark)] rounded p-4 mx-2"}>
            <div className={"flex justify-between items-baseline"}>
                <div className={"text-xs sm:text-sm text-[var(--text-light)]"}>
                    Objetivo de financiamiento para el mes actual
                </div>
                <InfoPanel
                    text={
                        value != undefined ? <div className="text-[var(--text-light)]">
                            <span>Si todos los usuarios aportaran ${value} por mes estaríamos 100% financiados. </span>
                            <Link className="link2" href={topicUrl("Cabildo_Abierto: Financiamiento", undefined, "normal")}>Más información.</Link>
                        </div> : <div>cargando...</div>
                    }
                />
            </div>
            <div className="flex items-center w-full space-x-1">
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner relative">
                    <div
                        className={`h-full ${progressColor} text-white text-center font-bold flex items-center justify-center`}
                        style={{width: `${p}%`}}
                    />
                    {/* Centered percentage */}
                    <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
                        {Math.round(p * 10) / 10}%
                    </div>
                </div>
            </div>
            <div className="mt-2">
                {state === "good" && (
                    <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
                        Tu aporte va a servir para el próximo mes.
                    </div>
                )}
                {(state === "medium" || state === "bad") && (
                    <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
                        ¡Necesitamos tu aporte!
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundingProgress;
