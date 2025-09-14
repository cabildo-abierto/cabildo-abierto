import {ReactNode} from "react";
import {Color} from "../../../modules/ui-utils/src/color";

export const FeatureSection = ({title, subtitle, description, image, inverted, background = "background"}: {
    title: string, subtitle?: string, description: ReactNode, image: ReactNode, inverted: boolean, background?: Color
}) => {
    return <div style={{background: `var(--${background})`}} className={"w-full flex justify-center"}>
        <div className={"sm:hidden"}>
            <div className={"flex-col space-y-20 py-20 items-center justify-center flex"}>
                <div className={"w-screen px-8 flex justify-center items-center"}>
                    <div className={"space-y-4"}>
                        <h2 className={"font-extrabold sm:text-3xl text-2xl leading-none"}>
                            {title}
                        </h2>
                        {subtitle && <div className={"text-sm sm:text-base text-[var(--text-light)]"}>
                            {subtitle}
                        </div>}
                        <div className={"font-light text-lg max-[400px]:text-base"}>
                            {description}
                        </div>
                    </div>
                </div>
                {image && <div className={"w-screen px-6 flex justify-center items-center font-light text-xl"}>
                    {image}
                </div>}
            </div>
        </div>

        <div className={"sm:flex hidden"}>
            <div
                className={"w-screen max-w-[1200px] h-[600px] space-y-0 flex-row items-center " + (inverted ? "flex flex-row-reverse" : "flex")}>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center flex-col"}>
                    <div className={"w-full max-w-[400px] space-y-2"}>
                        <h2 className={"font-extrabold md:text-[29px] text-2xl leading-tight"}>
                            {image ? title : null}
                        </h2>
                        {subtitle && image && <div className={"text-sm sm:text-base text-[var(--text-light)]"}>
                            {subtitle}
                        </div>}
                        <div className={"font-light md:text-xl text-lg"}>
                            {description}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 h-full px-8 flex justify-center items-center font-light text-xl"}>
                    {image ? image :
                        <div className={"space-y-2 max-w-[400px]"}>
                            <h2 className={"font-extrabold md:text-3xl text-2xl leading-tight"}>{title}</h2>
                            {subtitle && <div className={"text-sm sm:text-base text-[var(--text-light)]"}>
                                {subtitle}
                            </div>}
                        </div>}
                </div>
            </div>
        </div>
    </div>
}