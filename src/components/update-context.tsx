import { ContentProps, getPosts } from "@/actions/get-content";
import { EntityProps, getEntities } from "@/actions/get-entity";
import { getUsers, UserProps } from "@/actions/get-user";


export async function getContentsMap(){
    const _contents = await getPosts()
    const map: Record<string, ContentProps> = _contents.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, ContentProps>);
    return map
}


export async function getUsersMap(){
    const _users = await getUsers()
    const map: Record<string, UserProps> = _users.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, UserProps>);
    return map
}

export async function getEntitiesMap(){
    const _entities = await getEntities()
    const map: Record<string, EntityProps> = _entities.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, EntityProps>);
    return map
}