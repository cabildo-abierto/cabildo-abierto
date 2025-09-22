import {usePathname} from "next/navigation";

export function useTopbarTitle() {
    const pathname = usePathname()
    if(pathname.startsWith("/ajustes")){
        return {title: "Ajustes"}
    } else if(pathname.startsWith("/buscar")){
        return {title: "Buscar"}
    } else if(pathname.startsWith("/notificaciones")){
        return {title: "Notificaciones"}
    } else if(pathname.startsWith("/mensajes")){
        return {title: "Mensajes"}
    } else if(pathname.startsWith("/papeles")){
        return {title: "Tus papeles"}
    } else if(pathname.startsWith("/panel")){
        return {title: "Panel de autor"}
    } else if(pathname.startsWith("/perfil/cuentas-sugeridas")){
        return {title: "Cuentas para seguir"}
    } else if (pathname.startsWith("/tema?")){
        return {title: "Tema"}
    } else if (pathname.startsWith("/c")) {
        if(pathname.includes("quoted-by")){
            return {title: "Citas"}
        } else if(pathname.includes("liked-by")) {
            return {title: "Le gusta a"}
        } else if(pathname.includes("reposted-by")) {
            return {title: "Republicado por"}
        } else if(pathname.includes("article")){
            return {title: "Artículo"}
        } else if(pathname.includes("post")){
            return {title: "Publicación"}
        } else if(pathname.includes("dataset")){
            return {title: "Conjunto de datos"}
        }
    } else if(pathname.startsWith("/aportar")){
        return {title: "Aportar"}
    }
    return {}
}