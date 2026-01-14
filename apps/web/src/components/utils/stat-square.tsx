import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {ReactNode} from "react";
import ValidationIcon from "@/components/perfil/validation-icon";

export const StatSquare = ({
                        label,
                        value,
                        info,
                        moreInfoHref,
                        labelVerified,
                        valueVerified
                    }: {
    moreInfoHref?: string
    label: string
    value: string
    info?: ReactNode
    labelVerified?: string
    valueVerified?: string
}) => {
    return <DescriptionOnHover
        description={info}
        moreInfoHref={moreInfoHref}
    >
        <div
            className={"relative border border-[var(--accent-dark)] min-w-32 h-32 flex-col text-[30px] space-y-2 text-center flex items-center justify-center"}
        >
            <div>
                <div className={"px-2 font-bold"}>
                    {value}
                </div>
                <div className={"font-light text-center text-sm text-[var(--text-light)] px-2"}>
                    {label}
                </div>
            </div>

            {valueVerified != null && <div className={"absolute bottom-1 left-2 text-[var(--text-light)]"}>
                <div className={"text-xs flex space-x-1 items-center"}>
                    <div>
                        {valueVerified}
                    </div>
                    <div className={"pb-[2px]"}>
                        <ValidationIcon
                            handle={undefined}
                            verification={"persona"}
                            fontSize={12}
                        />
                    </div>
                </div>
            </div>}
        </div>
    </DescriptionOnHover>
}