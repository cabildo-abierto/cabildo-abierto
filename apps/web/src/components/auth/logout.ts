import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {post} from "@/components/utils/react/fetch";


export const useLogout = () => {
    const qc = useQueryClient()
    const router = useRouter()

    async function logout() {
        const {error} = await post("/logout")
        if(error) return {error}
        qc.clear()
        router.push("/")
    }

    return {logout}
}