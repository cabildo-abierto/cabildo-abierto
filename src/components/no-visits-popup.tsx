import Link from "next/link";
import { monthly_visits_limit } from "./utils";


export const NoVisitsAvailablePopup: React.FC<any> = ({ children }) => {
    return (
        <>
            <div className="relative z-0">
                {children}
            </div>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <h3 className="py-4 text-lg">Creá una cuenta para seguir leyendo</h3>
                    <div>Ya leíste más de {monthly_visits_limit} contenidos este mes, registrate para seguir leyendo. ¡Es gratis!</div>
                    <div className="flex justify-center items-center py-8 space-x-4">
                        <Link href="/" className="gray-btn">
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};