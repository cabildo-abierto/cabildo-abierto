import React from 'react';
import InfoPanel from '../../../modules/ui-utils/src/info-panel';
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import {topicUrl} from "@/utils/uri";
import {useFundingState, useMonthlyValue} from "@/queries/useFunding";

const FundingProgress = () => {
    let {data: progress, isLoading: isLoadingFundingState} = useFundingState()
    const { data: value } = useMonthlyValue()

    const state = isLoadingFundingState ? "loading" : (progress === 100 ? 'good' : progress >= 80 ? 'medium' : 'bad')
    const progressColor = state === "good" ? 'bg-green-500' : state === "medium" ? 'bg-yellow-500' : state == "bad" ? 'bg-red-500' : "bg-[var(--background-dark3)]";

    return (
        <div className={"space-y-2 w-full p-4 mx-2 border border-[var(--text-lighter)]"}>
            <div className={"flex justify-between items-baseline"}>
                <div className={"text-xs font-light sm:text-sm text-[var(--text-light)]"}>
                    Objetivo de financiamiento
                </div>
                <InfoPanel
                    text={
                        value != undefined ? <div className="text-[var(--text-light)]">
                            <span>Si todos los usuarios activos aportaran ${value} por mes estaríamos 100% financiados. </span>
                            <Link className="link2" href={topicUrl("Cabildo Abierto: Financiamiento", undefined, "normal")}>Más información</Link>.
                        </div> : <div>cargando...</div>
                    }
                />
            </div>
            <div className="flex items-center w-full space-x-1">
                <div className="w-full border border-[var(--text-lighter)] h-8 overflow-hidden shadow-inner relative">
                    <div
                        className={`h-full ${progressColor}  text-center font-bold flex items-center justify-center`}
                        style={{width: `${state == "loading" ? 0 : progress}%`}}
                    />
                    {state != "loading" && <div className="absolute inset-0 flex items-center justify-center text-[var(--text)] font-semibold">
                        {Math.round(progress * 10) / 10}%
                    </div>}
                </div>
            </div>
            <div className="mt-2">
                {state == "good" && (
                    <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
                        ¡Vamos bien! Aportá para que Cabildo Abierto crezca.
                    </div>
                )}
                {(state == "medium" || state == "bad") && (
                    <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
                        ¡Necesitamos tu aporte!
                    </div>
                )}
            </div>
        </div>
    );
};

export default FundingProgress;
