import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {post} from "@/components/utils/react/fetch";


export const useLogout = () => {
    const qc = useQueryClient()
    const router = useRouter()

    async function logout(): Promise<{error?: string}> {
        const res = await post("/logout")
        if(res.success === false) return {error: res.error}
        qc.clear()
        router.push("/")
        return {}
    }

    return {logout}
}