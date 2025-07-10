import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import Newspaper from "@mui/icons-material/Newspaper";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";

const AddToEnDiscusionButton = ({enDiscusion, setEnDiscusion}: {
    enDiscusion: boolean,
    setEnDiscusion: (e: boolean) => void
}) => {

    const description = <div>
        {'Agregar al muro "En discusión".'} <Link href={topicUrl("Cabildo Abierto: Muros")} target="_blank"
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
            color={enDiscusion ? "background-dark3" : "background-dark"}
            textColor={enDiscusion ? "text" : "text-lighter"}
        >
            <Newspaper color={"inherit"}/>
        </IconButton>
    </DescriptionOnHover>
}


export default AddToEnDiscusionButton;