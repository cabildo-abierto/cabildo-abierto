import { ContentProps, getPosts } from "@/actions/get-content";
import { EntityProps, getEntities } from "@/actions/get-entity";
import { getUser, getUsers, UserProps } from "@/actions/get-user";
import { getSubscriptionPoolSize, getSubscriptionPrice } from "@/actions/subscriptions";


export async function updateContents(setContents: any){
    const _contents = await getPosts()
    const map: Record<string, ContentProps> = _contents.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, ContentProps>);
    setContents(map)
}


export async function updateUser(setUser: any){
    const user = await getUser()
    setUser(user)
}


export async function updateUsers(setUsers: any){
    const _users = await getUsers()
    const map: Record<string, UserProps> = _users.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, UserProps>);
    setUsers(map)
}


export async function updatePoolSize(setPoolSize: any){
    const poolSize = await getSubscriptionPoolSize()
    setPoolSize(poolSize)
}


export async function updateEntities(setEntities: any){
    const _entities = await getEntities()
    const map: Record<string, EntityProps> = _entities.reduce((acc, obj) => {
        acc[obj.id] = obj;
        return acc;
    }, {} as Record<string, EntityProps>);
    setEntities(map)
}


export async function updatePrice(setPrice: any){
    const price = await getSubscriptionPrice()
    setPrice(price)
}