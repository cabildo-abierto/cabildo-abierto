"use client"
import { useEffect, useState } from "react";
import Footer from "../components/footer"
import { LogoAndSlogan } from "../components/presentation"
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { useUser } from "../app/hooks/user";
import { fetcher } from "../app/hooks/utils";
import { InvalidConfirmLinkPopup } from "../app/invalid-confirm-link-popup";
import Link from "next/link";
import { Button } from "@mui/material";
import Image from 'next/image'
import { isMobile } from 'react-device-detect'


export const HomePage = ({ searchParams, state }: { searchParams: { code?: string, error_description?: string }, state: "login" | "signup" | "none" }) => {
    const [invalidLink, setInvalidLink] = useState(searchParams.error_description == "Email link is invalid or has expired" || searchParams.error_description == "confirm")
    const router = useRouter()
    const user = useUser() // para prefetchearlo
    // const [showingInitialMessage, setShowingInitialMessage] = useState(true)

    useEffect(() => {
        preload("/api/entity/Cabildo_Abierto", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Términos_y_condiciones", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Política_de_privacidad", fetcher)
        preload("/api/user", fetcher)
    }, [])

    return <div className="flex flex-col justify-between">
        <InvalidConfirmLinkPopup open={invalidLink} onClose={() => { setInvalidLink(false); router.push("/") }} />

        <div className="flex flex-col items-center px-1 h-full mt-24">

            <div className="flex flex-col justify-center items-center">

                <LogoAndSlogan />

                <div className="flex flex-col space-y-2 mt-12">

                    <Link href="/signup">
                        <Button
                            color="primary"
                            size={!isMobile ? "large" : "medium"}
                            variant="contained"
                            disableElevation={true}
                            sx={{
                                textTransform: "none",
                                width: !isMobile ? "240px" : "170px"
                            }}
                        >
                            <div className="title">Crear una cuenta</div>
                        </Button>
                    </Link>

                    <Link href="/login">
                        <Button
                            color="primary"
                            size={!isMobile ? "large" : "medium"}
                            variant="contained"
                            disableElevation={true}
                            sx={{
                                textTransform: "none",
                                width: !isMobile ? "240px" : "170px"
                            }}
                        >
                            <div className="title">Iniciar sesión</div>
                        </Button>
                    </Link>
                </div>
            </div>
            
            <div className="max-w-[800px] w-full flex flex-col md:flex-row items-center justify-center md:space-x-32 mt-64 md:mt-32">
                <div className="">
                <div className="relative w-[400px]">
                    <div className="absolute left-0 top-[-140px]">
                        <Image
                            src="/ley-bases.png"
                            width={400}
                            height={300}
                            alt="Ley bases"
                            className="rounded-lg shadow-lg w-[350px]"
                        />
                    </div>
                    <div className="absolute z-2 left-[150px] top-[-40px]">
                        <Image
                            src="/inflacion.png"
                            width={400}
                            height={300}
                            alt="Inflación"
                            className="rounded-lg shadow-lg w-64 h-auto"
                        />
                    </div>
                </div>
                </div>
                <div className="md:max-w-[300px] h-full text-center md:px-0 px-4 mt-64 md:mt-0">
                    <h2 className="">Toda la información en un solo lugar</h2>
                    <div className="text-lg mt-4">
                        <p>Estamos construyendo una <Link href="https://es.wikipedia.org/wiki/Wiki" className="hover:underline">wiki</Link> sobre los temas de la discusión pública. </p>
                        <p className="mt-4">Reunimos documentos oficiales, datos y explicaciones.</p>
                        <p className="mt-4">Cualquiera que tenga una cuenta puede participar.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center space-x-6 md:mt-64 mt-32">
                <h2 className="text-center">Todo está abierto a discusión</h2>
                <div className="mt-16 flex flex-col md:flex-row justify-center md:space-y-0 md:space-x-10 space-y-16">
                    <div className="flex flex-col items-center text-center">
                        <h4>Comentá sobre el texto</h4>
                        <div className="text-lg">
                            <p>Opiná sobre lo que leés</p><p>directamente donde lo leés.</p>
                        </div>
                        <Image
                            src="/comentarios-texto.png"
                            width={700}
                            height={300}
                            alt="Comentarios"
                            className="rounded-lg shadow-xl w-[300px] h-auto mt-10"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <h4>Escribí publicaciones</h4>
                        <div className="text-lg">
                            Sin límite de caracteres.
                        </div>
                        <Image
                            src="/publicación.png"
                            width={700}
                            height={700}
                            alt="Publicación"
                            className="rounded-lg shadow-xl w-[200px] h-auto mt-10"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <h4>O hacé publicaciones rápidas</h4>
                        <div className="text-lg">
                            Hasta 300 caracteres.
                        </div>
                        <Image
                            src="/rápida.png"
                            width={700}
                            height={300}
                            alt="Publicación rápida"
                            className="rounded shadow-xl w-[280px] h-auto mt-10"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center px-2 mt-48">
                <h2><span className="">Vos elegís</span> el contenido que consumís</h2>
                <div className="text-lg max-w-[500px] mt-8">No hay publicidad y los algoritmos usados van a ser siempre transparentes, configurables y sin personalización automática.</div>
            </div>

            <div className="flex justify-between mt-48">
                <div className="flex justify-center md:flex-row flex-col-reverse md:h-[300px] md:space-x-32 space-y-12 md:space-y-0">
                    <div className="flex justify-center items-center flex-col mt-12 md:mt-0">
                        <Image
                            src="/sad-robot.png"
                            width={700}
                            height={700}
                            alt="Robot triste"
                            className="rounded-xl shadow-lg h-[200px] w-auto"
                        />
                        <div className="text-gray-400 text-sm">Imagen generada por Midjourney.</div>
                    </div>
                    <div className="max-w-[400px] h-full flex flex-col justify-center text-lg text-center">
                        <h2 className="">El cabildo es solo para seres humanos</h2>
                        <p className="mt-4">Verificamos que los usuarios sean personas reales con su DNI.</p>
                        <p className="mt-4">Después de la verificación tu cuenta puede ser anónima.</p>
                        <p className="mt-4">Gracias a esto, podemos (por ejemplo) mostrarte cuántas personas reales distintas vieron una publicación, o le dieron me gusta.</p>
                    </div>
                </div>
            </div>

            {false && <div>
                Conexión con Bluesky
            </div>}

            <div className="flex flex-col-reverse items-center md:flex-row md:space-x-16 mt-48 mb-32">
                <div className="mt-8 md:mt-0">
                    <Image
                        src="/remuneraciones.svg"
                        alt="Remuneraciones a autores"
                        width={700}
                        height={500}
                        className="w-[450px] h-auto"
                    />
                </div>
                <div className="max-w-[350px] w-full flex flex-col items-center text-center px-2 md:px-0">
                    <h2>Queremos que cualquiera pueda vivir de escribir para la discusión pública</h2>
                    <p className="mt-8 text-lg">
                        Cabildo Abierto se financia con aportes voluntarios.
                    </p>
                    <p className="mt-6 text-lg">
                        Con eso, remuneramos a cada autor en función del valor que generó en otros usuarios.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    </div>
}