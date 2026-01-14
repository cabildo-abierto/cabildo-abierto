import {ReactNode} from "react";
import {cn} from "@/lib/utils";


export const FeatureSection = ({title, subtitle, image, inverted, className}: {
    title: string
    subtitle: string
    image: ReactNode
    inverted: boolean
    className?: string
}) => {

    const titleClassName = "tracking-tight leading-tight font-light"
    const subtitleClassName = "tracking-tight leading-tight font-light"

    return <div className={cn("w-full flex justify-center", className)}>

        {/* Mobile */}
        <div className={"sm:hidden"}>
            <div className={"flex-col space-y-20 py-20 items-center justify-center flex"}>
                <div className={"w-screen px-8 flex justify-center items-center"}>
                    <div className={"font-light text-lg max-[400px]:text-base"}>
                        <div className={"space-y-2 max-w-[400px]"}>
                            <div className={cn("text-2xl", titleClassName)}>
                                {title}
                            </div>
                            <div
                                className={cn("text-base", subtitleClassName)}
                            >
                                {subtitle}
                            </div>
                        </div>
                    </div>
                </div>
                {image && <div className={"w-screen px-6 flex justify-center items-center font-light text-xl"}>
                    {image}
                </div>}
            </div>
        </div>

        {/* Desktop */}
        <div className={"sm:flex hidden w-full max-w-[1200px]"}>
            <div
                className={"w-full h-[550px] space-y-0 flex-row items-center " + (inverted ? "flex flex-row-reverse" : "flex")}>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center flex-col"}>
                    <div className={"w-full max-w-[400px] space-y-2"}>
                        <div className={"space-y-2 max-w-[400px]"}>
                            <div className={cn("text-2xl", titleClassName)}>
                                {title}
                            </div>
                            <div
                                className={cn("text-base", subtitleClassName)}
                            >
                                {subtitle}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center font-light"}>
                    {image}
                </div>
            </div>
        </div>
    </div>
}