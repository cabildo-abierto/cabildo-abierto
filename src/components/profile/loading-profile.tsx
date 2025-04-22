import {emptyChar} from "@/utils/utils";


export const LoadingProfile = () => {
    return <div className="flex flex-col pb-64">
        <div className={"flex flex-col"}>
            <div className="w-full h-[130px] bg-[var(--background-dark)]">
                {emptyChar}
            </div>
            <div className={"w-24 h-24 ml-6 mt-[-48px] rounded-full border-2 border-[var(--background)] bg-[var(--background-dark)]"}>
                {emptyChar}
            </div>
        </div>
    </div>
}