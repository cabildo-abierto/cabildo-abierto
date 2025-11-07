import {cn} from "@/lib/utils";
import {MPWallet} from "@/components/aportar/mp-wallet";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const WalletPage = ({amount, preferenceId, verification}: {
    amount: number
    preferenceId: string
    verification: boolean
}) => {
    const {isMobile} = useLayoutConfig()

    return <div className={cn("p-16 font-light panel-dark mt-4 flex flex-col items-center space-y-8", isMobile && "w-auto mx-2 mt-0")}>
        <div className={"text-center"}>
            Aportando ${amount}.
        </div>
        <MPWallet preferenceId={preferenceId} verification={verification} />
    </div>
}