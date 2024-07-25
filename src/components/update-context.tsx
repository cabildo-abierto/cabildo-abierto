import { ContentProps, getPosts } from "@/actions/get-content";
import { getUser } from "@/actions/get-user";


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