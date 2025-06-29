import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import Newspaper from "@mui/icons-material/Newspaper";

const AddToEnDiscusionButton = ({enDiscusion, setEnDiscusion}: {
    enDiscusion: boolean,
    setEnDiscusion: (e: boolean) => void
}) => {
    return <IconButton
        onClick={() => {
            setEnDiscusion(!enDiscusion)
        }}
        size={"small"}
        color={"background-dark"}
        textColor={enDiscusion ? "text" : "text-lighter"}
        title={'Agregar al muro "En discusión"'}
    >
        <Newspaper color={"inherit"}/>
    </IconButton>
}


export default AddToEnDiscusionButton;