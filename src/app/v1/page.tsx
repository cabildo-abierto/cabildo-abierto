import Link from "next/link";


const Page = () => {
    return <div className={"flex flex-col w-screen items-center justify-center h-screen"}>
        <h1>Migración desde la primera versión</h1>
        <div className={"mt-8 text-lg max-w-[600px] space-y-2 text-[var(--text-light)]"}>
            <p>Estamos construyendo una nueva versión con bastantes cambios y cosas nuevas.
                Pero no te preocupes, todo lo que tenía la primera versión se va a mantener y no vas a perder tus publicaciones.
            </p>
            <p>
                La nueva versión se va a abrir con un período de prueba por invitación y los usuarios de la versión anterior van a ser los primeros invitados a participar.
            </p>
            <p>
                Al iniciar sesión en la nueva versión vas a poder recuperar todas tus publicaciones. Si necesitás acceder a algo antes escribinos a soporte@cabildoabierto.com.ar.
            </p>
            <p className={"flex justify-end link"}>
                <Link href={"/login"}>Volver</Link>
            </p>
        </div>
    </div>
}


export default Page