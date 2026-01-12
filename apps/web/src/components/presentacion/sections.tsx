import Image from 'next/image'
import {useTheme} from "@/components/layout/theme/theme-context";


export const FormatGrid = () => {
    const {currentTheme} = useTheme()

    return <div className={"flex space-x-2 max-w-[600px] opacity-90"}>
        <div className={"flex flex-col space-y-2 h-full justify-center w-1/2"}>
            <Image
                src={`/presentacion/${currentTheme}/rápida.png`}
                width={2000}
                height={600}
                alt="Publicación rápida"
                className="border w-full h-auto mt-10"
            />
            <Image
                src={`/presentacion/${currentTheme}/artículo.png`}
                width={700}
                height={700}
                alt="Publicación"
                className="border w-full h-auto"
            />
        </div>
        <div className={"flex flex-col space-y-2 w-1/2"}>
            <Image
                src={`/presentacion/${currentTheme}/comentarios-texto.png`}
                width={700}
                height={700}
                alt="Publicación"
                className="border w-full h-auto mt-10"
            />
            <Image
                src={`/presentacion/${currentTheme}/editor.png`}
                width={700}
                height={700}
                alt="Publicación"
                className="border w-full h-full object-contain"
            />
        </div>
    </div>
}