import {IconButton} from "../layout/utils/icon-button";
import DescriptionOnHover from "../layout/utils/description-on-hover";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";
import EnDiscusionIcon from "@/components/layout/icons/en-discusion-icon";

const AddToEnDiscusionButton = ({enDiscusion, setEnDiscusion}: {
    enDiscusion: boolean,
    setEnDiscusion: (e: boolean) => void
}) => {

    const description = <div>
        {'Agregar al muro "En discusión".'} <Link
        href={topicUrl("Cabildo Abierto: Muros")}
        target="_blank"
        className={"hover:underline text-[var(--text-light)]"}>Más
        información.</Link>
    </div>

    return <DescriptionOnHover description={!enDiscusion ? description : null}>
        <IconButton
            onClick={e => {
                e.stopPropagation()
                setEnDiscusion(!enDiscusion)
            }}
            size={"small"}
            color={enDiscusion ? "background-dark2" : "transparent"}
            textColor={enDiscusion ? "text" : "accent-dark"}
            sx={{
                borderRadius: 0
            }}
        >
            <EnDiscusionIcon fontSize={20}/>
        </IconButton>
    </DescriptionOnHover>
}


export default AddToEnDiscusionButton;