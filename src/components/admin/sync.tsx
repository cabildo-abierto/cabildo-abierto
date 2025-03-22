"use client"
import StateButton from "../ui-utils/state-button";
import React, {useState} from "react";
import {getDirtyUsers} from "../../actions/sync/mirror-status";
import {AdminSection} from "./admin-section";
import {getUsers} from "../../actions/user/users";
import {SmallUserProps} from "../../app/lib/definitions";
import {ListEditor} from "../ui-utils/list-editor";
import {collectionsList} from "../../actions/sync/utils";
import {syncAllUsers, syncUser} from "../../actions/sync/sync-user";


export const AdminSync = () => {
    const [users, setUsers] = useState<SmallUserProps[] | null>(null)
    const [dirtyUsers, setDirtyUsers] = useState<string[] | null>(null)
    const [collections, setCollections] = useState<string[]>([])


    return <div className={"flex flex-col items-center mt-8 space-y-8 mb-64"}>

        <AdminSection title={"Dirty users"}>
            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Dirty users?"}
                handleClick={async () => {
                    const users = await getDirtyUsers()
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

        <AdminSection title={"Usuarios"}>

            <div>
                <ListEditor
                    newItemText={"collection"}
                    items={collections}
                    setItems={setCollections}
                    options={collectionsList}
                />
            </div>

            <div className={"flex justify-center"}>
            <div className={"space-y-4"}>
            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Leer usuarios"}
                handleClick={async () => {
                    const {users} = await getUsers()
                    setUsers(users)
                    return {}
                }}
            />

            <StateButton
                size={"small"}
                fullWidth={true}
                text1={"Sync all"}
                handleClick={async () => {
                    await syncAllUsers(collections, 1, true)
                    const {users} = await getUsers()
                    setUsers(users)
                    return {}
                }}
            />
            </div>
            </div>

            {users && <>
                <div>
                    Total: {users.length}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {users.map((u, index) => (
                        <React.Fragment key={index}>
                            <div>
                                <div>
                                    {u.did}
                                </div>
                                <div>
                                    {u.handle ? u.handle : "sin handle"}
                                </div>
                            </div>
                            <div>
                                <div>
                                    {u.inCA ? "In CA" : "Not in CA"}
                                </div>
                                <div>
                                    {u.CAProfileUri != null ? "Profile OK" : "No profile"}
                                </div>
                            </div>
                            <div>
                                <StateButton
                                    size={"small"}
                                    fullWidth={true}
                                    text1={"Sync"}
                                    handleClick={async () => {
                                        await syncUser(u.did, collections, 1)
                                        const {users} = await getUsers()
                                        setUsers(users)
                                        return {}
                                    }}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </>}
        </AdminSection>
    </div>
}