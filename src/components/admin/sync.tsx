"use client"
import StateButton from "../ui-utils/state-button";
import React, {useState} from "react";
import {getDirtyUsers} from "../../actions/sync/mirror-status";
import {AdminSection} from "./admin-section";


export const AdminSync = () => {

    const [dirtyUsers, setDirtyUsers] = useState<string[] | null>(null)

    return <div className={"flex flex-col items-center mt-8"}>

        <AdminSection title={"Dirty users"}>
            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Dirty users?"}
                handleClick={async () => {
                    const users = await getDirtyUsers()
                    console.log("dirty users", users)
                    setDirtyUsers(users)
                    return {}
                }}
            />

            {dirtyUsers != null && <div className={"flex flex-col space-y-1"}>
                <div>
                    Total: {dirtyUsers.length}
                </div>
                {dirtyUsers.map((user, index) => {
                    return <div key={index}>
                        {user}
                    </div>
                })}
            </div>}
        </AdminSection>
    </div>
}