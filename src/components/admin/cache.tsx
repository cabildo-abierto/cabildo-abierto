"use client"

import StateButton from "../layout/utils/state-button";
import {TextField} from "@mui/material";
import {useState} from "react";

export const AdminCache = () => {
    const [tag, setTag] = useState("");

    return <div className="flex flex-col items-center mt-8">

        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <StateButton
                handleClick={async () => {
                    //await revalidateEverything()
                    return {}
                }}
                text1={"Revalidar todo"}
            />

            <StateButton
                handleClick={async () => {
                    //await revalidateTags(["topics"])
                    return {}
                }}
                text1={"Revalidar temas"}
            />

            <div className={"flex items-center space-x-2 w-90"}>
                <div className={"w-48"}>
                    <TextField
                        size={"small"}
                        placeholder={"tag"}
                        value={tag}
                        onChange={(e) => {
                            setTag(e.target.value)
                        }}
                        fullWidth={true}
                    />
                </div>

                <div>
                    <StateButton
                        size={"small"}
                        fullWidth={true}
                        text1={"Revalidar"}
                        handleClick={async () => {
                            //await revalidateTags([tag])
                            return {}
                        }}
                    />
                </div>
            </div>

        </div>
    </div>
}