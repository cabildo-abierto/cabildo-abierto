import {emptyChar} from "../utils/utils";


export const LoadingProfile = () => {
    return <div className="flex flex-col pb-64 mt-2">
        <div className={"flex flex-col"}>
            <div className="w-full h-[150px] bg-[var(--background-dark)]">
                {emptyChar}
            </div>
            <div className={"w-[88px] h-[88px] ml-6 mt-[-44px] rounded-full border-2 border-[var(--background)] bg-[var(--background-dark)]"}>
                {emptyChar}
            </div>
        </div>
    </div>
}