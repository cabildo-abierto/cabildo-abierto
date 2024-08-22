import Link from 'next/link';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArticleIcon from '@mui/icons-material/Article';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { LoginButton, SignupButton } from '@/components/home-page';

export const PeriodoDePrueba = () => {
    return <div className="flex justify-center">
        <div className="mt-8 px-4">
        <div className="text-[var(--accent-dark)] flex items-center border p-2 rounded">
            <div className="mr-2">
                <ConstructionIcon fontSize="large" />
            </div>
            <div className="flex justify-center">
                La plataforma está en período de prueba cerrada. 
                {false && "Podés escribirnos a contacto@cabildoabierto.com.ar"}
            </div>
        </div>
        </div>
    </div>
}


const Feature = ({text, className}: {text: string, className: string}) => {
    return <div className="flex items-center py-2">
        <div className="ml-2">
            <ArrowForwardIosIcon/>
        </div>
        <div className={"ml-3 flex items-center font-semibold "+className}>
            {text}
        </div>
    </div>
}


export const Features = () => {
  return (
    <div className="flex flex-col items-center mt-8 text-lg content">
        <div className="mb-2 w-128 text-center">
            Cabildo Abierto es una plataforma en la que vas a encontrar <span className="font-bold">información</span> y <span className="font-bold">análisis</span>:
        </div>
        <div className="flex flex-col w-128 px-4">
            <Feature text="independiente," className="text-[var(--primary)]"/>
            <Feature text="abierto a discusión," className="text-[var(--primary)]"/>
            <Feature text="y escrito y financiado por la comunidad." className="text-[var(--primary)]"/>
            {true && <div className="mt-4">
                Sin algoritmos, bots, anonimato ni noticias falsas.
            </div>}
        </div>
    </div>
  );
};

export const Presentation: React.FC = () => {
    return <div className="flex-col justify-between">
        <div className="flex justify-center">
            <div className="flex justify-center">
                <h3 className="flex justify-center mt-20 lg:text-5xl md:text-4xl text-3xl px-2">Lo público abierto a discusión</h3>
            </div>
        </div>
        <Features/>

        {false && <div className="flex justify-center mt-8">
            <Link href="/articulo/Cabildo_Abierto">
                <button className="gray-btn">¿Qué es Cabildo Abierto?</button>
            </Link>
        </div>}

        {false && <div className="flex justify-center py-2 mt-16">
            {false && <LoginButton className="w-64 h-12 text-lg"/>}
            <SignupButton className="w-64 h-12 text-lg"/>
        </div>}
        <div className="flex justify-center mt-16">
            <SignupButton className="w-64 h-12 gray-btn font-semibold" text="Empezar"/>
        </div>
    </div>
};
