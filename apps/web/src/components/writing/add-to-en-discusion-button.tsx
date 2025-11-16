import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import EnDiscusionIcon from "@/components/utils/icons/en-discusion-icon";
import {BaseButtonProps} from "@/components/utils/base/base-button";

const AddToEnDiscusionButton = ({enDiscusion, setEnDiscusion, size}: {
    enDiscusion: boolean,
    setEnDiscusion: (e: boolean) => void
    size?: BaseButtonProps["size"]
}) => {

    const description = <div>
        {'Agregar al muro "En discusión".'} <Link
        href={topicUrl("Cabildo Abierto: Muros")}
        target="_blank"
        className={"hover:underline text-[var(--text-light)]"}>Más
        información.</Link>
    </div>

    return <DescriptionOnHover description={!enDiscusion ? description : null}>
        <BaseIconButton
            onClick={e => {
                e.stopPropagation()
                setEnDiscusion(!enDiscusion)
            }}
            size={size}
            className={enDiscusion ? "bg-[var(--background-dark2)] text-[var(--text)]" : "text-[var(--accent-dark)]"}
        >
            <EnDiscusionIcon/>
        </BaseIconButton>
    </DescriptionOnHover>
}


export default AddToEnDiscusionButton;