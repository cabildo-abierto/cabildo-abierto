import React from 'react';
import {useFundingState} from "@/queries/getters/useFunding";
import {Note} from "@/components/utils/base/note";

const FundingProgress = () => {
    let {data: progress, isLoading: isLoadingFundingState} = useFundingState()

    const state = isLoadingFundingState ? "loading" : (progress === 100 ? 'good' : progress >= 80 ? 'medium' : 'bad')
    const progressColor = state === "good" ? 'bg-green-500' : state === "medium" ? 'bg-yellow-500' : state == "bad" ? 'bg-red-500' : "bg-[var(--background-dark3)]";


    return (
        <div className={"space-y-4 w-full p-4 rounded-panel-dark2"}>
            <div className={"flex justify-between items-baseline"}>
                <Note className={"text-left"}>
                    Objetivo de financiamiento
                </Note>
            </div>
            <div className="flex items-center w-full space-x-1">
                <div className="w-full bg-[var(--background-dark3)] rounded-2xl h-8 overflow-hidden shadow-inner relative">
                    <div
                        className={`h-full ${progressColor} text-center font-bold flex items-center justify-center`}
                        style={{width: `${state == "loading" ? 0 : progress}%`}}
                    />
                    {state != "loading" && <div className="absolute inset-0 flex items-center justify-center text-[var(--text)] font-semibold">
                        {Math.round(progress * 10) / 10}%
                    </div>}
                </div>
            </div>
            <div className="mt-2">
                <Note>
                    {state == "good" && "¡Vamos bien! Aportá para ayudar a que Cabildo Abierto crezca."}
                    {state != "good" && "¡Necesitamos tu aporte!"}
                </Note>
            </div>
        </div>
    );
};

export default FundingProgress;
