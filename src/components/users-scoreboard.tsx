import {SmallUserProps, UserStats} from "../app/lib/definitions";
import Link from "next/link";


const UserInScoreboard = ({user, stats}: {user: SmallUserProps, stats: UserStats}) => {

    return <div className="w-full flex py-2 border-b">
        <div className="w-48 flex flex-col px-2">
            <Link className="hover:underline" href={"/perfil/" + user.id}>@{user.id}</Link>
            <span className="text-[var(--text-light)] text-sm">{user.name}</span>
        </div>

        <div className="w-48 text-center flex items-center justify-center">{stats.entityAddedChars}</div>
    </div>
}


export const UserScoreboard = ({users}: {users: {user: SmallUserProps, stats: UserStats}[]}) => {
    return <div className="flex flex-col">
            <div className="flex border-b items-center">
                <div className="w-48 text-center">Usuario</div>
                <div className="w-48 text-center">Caracteres agregados en artículos públicos</div>
            </div>
        <div>
        {users.map(({user, stats}, index) => {
            return <div className="" key={index}>
                <UserInScoreboard user={user} stats={stats}/>
            </div>
        })}
        </div>
    </div>
}