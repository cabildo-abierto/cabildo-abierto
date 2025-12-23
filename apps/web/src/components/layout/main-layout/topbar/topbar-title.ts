import {usePathname, useSearchParams} from "next/navigation";

export function useTopbarTitle(): {title?: string, className?: string} {
    const pathname = usePathname()
    const params = useSearchParams()
    if(pathname.startsWith("/ajustes")){
        if(pathname.includes("compartir")) {
            return {title: "Compartir"}
        } else if(pathname.startsWith("/ajustes/verificacion")) {
            if(pathname.startsWith("/ajustes/verificacion/verificar/org")) {
                return {title: "Verificación de organización"}
            } else if(pathname.startsWith("/ajustes/verificacion/verificar/persona")) {
                if(pathname.startsWith("/ajustes/verificacion/verificar/persona/dni")) {
                    return {title: "Verificación con DNI"}
                } else if(pathname.startsWith("/ajustes/verificacion/verificar/persona/mp")) {
                    return {title: "Verificación con Mercado Pago"}
                } else {
                    return {title: "Verificación de cuenta personal"}
                }
            } else if(pathname.startsWith("/ajustes/verificacion/verificar")) {
                return {title: "Verificar mi cuenta"}
            } else {
                return {title: "Verificación de cuentas"}
            }
        } else {
            return {title: "Ajustes"}
        }
    } else if(pathname.startsWith("/buscar")) {
        return {title: "Buscar"}
    } else if(pathname.startsWith("/perfil")){
        if(pathname.endsWith("/seguidores") || pathname.endsWith("/siguiendo")){
            const handle = pathname.split("/perfil/")[1].split("/")[0]
            return {title: `@${handle}`, className: "normal-case font-bold"}
        } else if(pathname.endsWith("/cuentas-sugeridas")) {
            return {title: "Cuentas sugeridas"}
        }
        return {title: "Perfil"}
    } else if(pathname.startsWith("/notificaciones")){
        return {title: "Notificaciones"}
    } else if(pathname.startsWith("/mensajes")){
        return {title: "Mensajes"}
    } else if(pathname.startsWith("/papeles")){
        return {title: "Tus papeles"}
    } else if(pathname.startsWith("/panel")){
        return {title: "Panel de autor"}
    } else if (pathname.startsWith("/tema") && !pathname.startsWith("/temas")) {
        return {title: "Tema"}
    } else if (pathname.startsWith("/c")) {
        if(pathname.endsWith("/citas")){
            return {title: "Citas"}
        } else if(pathname.endsWith("/me-gustas")) {
            return {title: "Le gusta a"}
        } else if(pathname.endsWith("/republicaciones")) {
            return {title: "Republicado por"}
        } else if(pathname.includes("/article/")){
            return {title: "Artículo"}
        } else if(pathname.includes("/post/")){
            return {title: "Publicación"}
        } else if(pathname.includes("/dataset/")){
            return {title: "Conjunto de datos"}
        }
    } else if(pathname.startsWith("/aportar")){
        return {title: "Aportar"}
    } else if(pathname.startsWith("/escribir/articulo")){
        if(params.get("r")){
            return {title: "Editar artículo"}
        } else {
            return {title: "Nuevo artículo"}
        }
    } else if(pathname.includes("/admin")){
        return {title: ""}
    } else if(pathname.startsWith("/soporte")) {
        return {title: "Soporte"}
    }
    return {}
}


export function useDefaultBackURL() {
    const pathname = usePathname()
    if(pathname.startsWith("/ajustes")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/buscar")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/notificaciones")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/mensajes")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/papeles")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/panel")){
        return {defaultURL: "/inicio"}
    } else if(pathname.startsWith("/perfil/cuentas-sugeridas")){
        return {defaultURL: "/inicio"}
    } else if (pathname.startsWith("/tema?")){
        return {defaultURL: "/inicio"}
    } else if (pathname.startsWith("/c")) {
        if(pathname.includes("quoted-by")){
            return {defaultURL: pathname.replace("/quoted-by", "")}
        } else if(pathname.includes("liked-by")) {
            return {defaultURL: pathname.replace("/liked-by", "")}
        } else if(pathname.includes("reposted-by")) {
            return {defaultURL: pathname.replace("/reposted-by", "")}
        } else if(pathname.includes("article")){
            return {defaultURL: "/inicio"}
        } else if(pathname.includes("post")){
            return {defaultURL: "/inicio"}
        } else if(pathname.includes("dataset")){
            return {defaultURL: "/inicio"}
        }
    } else if(pathname.startsWith("/aportar")){
        return {defaultURL: "/inicio"}
    }
    return {}
}