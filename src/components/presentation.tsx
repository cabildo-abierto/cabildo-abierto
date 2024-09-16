import Link from 'next/link';
import { Logo } from './logo';


export const Presentation: React.FC = () => {

    return <div className="flex flex-col justify-center items-center mt-32 lg:mt-0 px-2">
      <div className="mb-16 flex lg:h-28 h-16">
        <div className="">
          <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="ml-4 h-full flex justify-center flex-col">
          <h1 className="lg:text-5xl text-2xl">Cabildo Abierto</h1>
          <h3 className="text-gray-600 text-lg lg:text-3xl mt-2">Discutí lo público</h3>
        </div>
      </div>
      <Link href="/articulo/Cabildo_Abierto" className="text-lg link2 mb-16">¿Qué es Cabildo Abierto?</Link>
    </div>
};
