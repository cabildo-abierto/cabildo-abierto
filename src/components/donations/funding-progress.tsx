import React from 'react';
import InfoPanel from '../ui-utils/info-panel';
import { CustomLink as Link } from '../ui-utils/custom-link';
import { useSubscriptionPrice } from '../../hooks/subscriptions';
import {topicUrl} from "../utils/uri";

const FundingProgress = ({ p }: { p: number }) => {
  const state = p === 100 ? 'good' : p >= 90 ? 'medium' : 'bad';
  const progressColor = state === "good" ? 'bg-green-500' : state === "medium" ? 'bg-yellow-500' : 'bg-red-500';
  const { price } = useSubscriptionPrice();

  return (
    <div>
      <div className="flex items-center w-full space-x-1">
        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner relative">
          <div
            className={`h-full ${progressColor} text-white text-center font-bold flex items-center justify-center`}
            style={{ width: `${p}%` }}
          />
          {/* Centered percentage */}
          <div className="absolute inset-0 flex items-center justify-center text-black font-bold">
            {Math.round(p * 10) / 10}%
          </div>
        </div>
        <InfoPanel
          text={
            <div className="link">
              <span>Si todos los usuarios aportaran ${price.price} por mes estaríamos 100% financiados. </span>
              <Link href={topicUrl("Cabildo_Abierto:_Financiamiento")}>Leer más</Link>
            </div>
          }
        />
      </div>
      <div className="mt-2">
        {state === "good" && (
          <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
            Tu aporte va a servir para el próximo mes.
          </div>
        )}
        {(state === "medium" || state === "bad") && (
          <div className="text-xs sm:text-sm text-center text-[var(--text-light)]">
            ¡Necesitamos tu aporte para llegar a fin de mes!
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingProgress;
