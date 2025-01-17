import {Logo} from "../logo";
import PersonIcon from "@mui/icons-material/Person";
import {BasicButton} from "../ui-utils/basic-button";
import {useState} from "react";
import {TextField} from "@mui/material";
import {cleanText} from "../utils";
import {useCabildos} from "../../hooks/contents";
import {CabildoProps} from "../../app/lib/definitions";
import {useUser} from "../../hooks/user";
import StateButton from "../state-button";
import {joinCabildo} from "../../actions/cabildos";


const CabildoOption = ({cabildo}: {cabildo: CabildoProps}) => {
    return <BasicButton
        variant={"contained"}
        color={"inherit"}
        sx={{
            width: "100%",
            borderColor: "var(--accent)",
            backgroundColor: "var(--background-dark2)",
            ":hover": {
                backgroundColor: "var(--background-dark3)",
            }
        }}
    >
        <div className={"flex items-center space-x-2"}>
            <div>
                {cabildo.cabildo.name}
            </div>
            <div className={"text-[var(--text-light)] text-sm flex space-x-1 items-center"}>
                <div>{cabildo.cabildo.members.length}</div>
                <PersonIcon fontSize={"inherit"}/>
            </div>
        </div>
    </BasicButton>
}


export const CurrentCabildo = ({curCabildoName}: {curCabildoName?: string}) => {
    const [changing, setChanging] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const {user} = useUser()
    const {cabildos} = useCabildos()
    if (!cabildos || cabildos.length == 0) {
        return null
    }

    async function onJoin(cabildoUri: string){
        const {error} = await joinCabildo(cabildoUri)
        return {error}
    }

    if(curCabildoName == undefined) {
        return null
    } else {
        const filteredCabildos = cabildos.filter((c: CabildoProps) => (cleanText(c.cabildo.name).includes(cleanText(searchValue))))

        const curCabildoIndex = cabildos.findIndex((c: CabildoProps) => c.cabildo.name == curCabildoName)
        const curCabildo = cabildos[curCabildoIndex]
        const isMember = curCabildo.cabildo.members.some(({did}) => (did == user.did))


        return <>
            <div className={"flex justify-between bg-[var(--background-dark)] rounded p-2"}>
                <div className={"w-16"}>
                    &nbsp;
                </div>
                <div
                    className={"flex flex-col items-center w-full space-y-1"}>
                    <div className={"flex justify-center space-x-3"}>
                        <Logo className={"h-6 w-6"}/>
                    </div>
                    <div>
                        {curCabildo.cabildo.name}
                    </div>
                    <div className={"text-[var(--text-light)] text-sm flex space-x-1 items-center"}>
                        <div>{curCabildo.cabildo.members.length}</div>
                        <PersonIcon fontSize={"inherit"}/>
                    </div>
                </div>
                <div className={"w-16 flex flex-col justify-between"}>
                    <div>
                        {!isMember ? <StateButton
                            handleClick={async () => {return await onJoin(curCabildo.uri)}}
                            variant={"contained"}
                            color={"primary"}
                            disableElevation={true}
                            text1={"unirme"}
                            size={"small"}/> : <span>&nbsp;</span>}
                    </div>
                    <div className={"text-[var(--text-light)]"}>
                        <BasicButton onClick={() => {
                            setChanging(!changing)
                        }} variant={"text"} color={changing ? "primary" : "inherit"} size={"small"}>
                            {changing ? "cancelar" : "cambiar"}
                        </BasicButton>
                    </div>
                </div>
            </div>

            {changing && <div className={"flex flex-col space-y-1 w-full"}>
                <div>
                    <TextField
                        size={"small"}
                        fullWidth
                        placeholder={"buscar"}
                        value={searchValue}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                padding: '4px 4px', // Adjust padding
                                fontSize: '14px', // Smaller text
                                height: '35px', // Adjust height
                                '& fieldset': {
                                    borderColor: 'var(--accent)'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'var(--accent)'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--accent)'
                                },
                                autoComplete: 'off',
                            },
                        }}
                        onChange={(e) => {
                            setSearchValue(e.target.value)
                        }}
                    />
                </div>
                {filteredCabildos.slice(0, 5).map((c, index) => {
                    return <div key={index}>
                        <CabildoOption cabildo={c}/>
                    </div>
                })
                }
                {filteredCabildos.length == 0 &&
                    <div className={"pt-2 text-sm text-center text-[var(--text-light)]"}>No se encontró el
                        cabildo.</div>}
            </div>}
        </>
    }
}