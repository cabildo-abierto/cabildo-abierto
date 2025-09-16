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
    }
    return {}
}