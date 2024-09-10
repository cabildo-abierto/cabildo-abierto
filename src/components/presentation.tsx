import Link from 'next/link';
import { Logo } from './logo';


export const Presentation: React.FC = async () => {

    return <div className="flex flex-col justify-center items-center h-screen">
      <div className="mb-16 flex h-28">
        <div className="">
          <Logo className="w-28 h-28"/>
        </div>
        <div className="ml-4 h-full flex justify-center flex-col">
          <h1 className="text-5xl">Cabildo Abierto</h1>
          <h3 className="text-gray-600 text-3xl mt-2">Discutí lo público</h3>
        </div>
      </div>
      <Link href="/articulo/Cabildo_Abierto" className="text-lg link2">¿Qué es Cabildo Abierto?</Link>
    </div>
};
