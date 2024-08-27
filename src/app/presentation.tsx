import Link from 'next/link';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SignupButton } from '@/components/home-page';
import { ReactNode } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

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

const Explanation = ({children, id, title}: {children: ReactNode, id: string, title: string}) => {
    return <div className="w-full border-[var(--accent)] border-t" id={id}>
        {false && <div className="flex justify-end">
        <Link href="#start" className="hover:bg-[var(--accent-light)] rounded my-1 mx-1">
        <ArrowUpwardIcon/>
        </Link>
        </div>}

        <div className="flex justify-center text-center">
        <h3 className="mt-4 mb-8">{title}</h3>
        </div>
        <div className="text-lg mb-16">
        {children}
        </div>
    </div>
}

const Explainable = ({text, id}: {text: string, id?: string}) => {
    return <Link
        href={"#" + (id ? id : text)}
        className="hover:text-[var(--primary)] cursor-pointer">
        {text}
    </Link>
}


const Table = () => {
    return <div className="flex justify-center">
    <div>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Nivel</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Permisos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2 font-bold">Sin autenticar</td>
            <td className="border px-4 py-2">Una cuenta recién creada.</td>
            <td className="border px-4 py-2">Leer.</td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Autenticado anónimo</td>
            <td className="border px-4 py-2">
              Verificó que es una persona real y que es su única cuenta pero no muestra su identidad públicamente. Puede reaccionar y comentar.
            </td>
            <td className="border px-4 py-2">
              Además, reaccionar y comentar.
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2 font-bold">Autenticado público</td>
            <td className="border px-4 py-2">
              Aunque puede seguir presentándose con un alias, su nombre real aparece en la descripción de su perfil.
            </td>
            <td className="border px-4 py-2">
              Además, escribir publicaciones y contribuir en artículos colaborativos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
}


export const Presentation: React.FC = () => {
    return <div className="flex flex-col items-center text-gray-900">
        <div className="flex justify-center">
            <div className="flex flex-col justify-center">
                <h3 className="flex justify-center text-center mt-20 lg:text-4xl md:text-4xl text-3xl px-2">
                    Una plataforma para la discusión pública
                </h3>
            </div>
        </div>

        <div className="flex flex-col items-center py-16  max-w-[800px]">
            <div className="bg-gray-200 rounded px-8 py-3">
            <div className="mb-2 text-center text-xl">
                <Explainable text="Información" id="informacion"/> <Explainable text="abierta a discusión" id="abierta"/>. 
            </div>
            <div className="text-center text-xl mb-2">
                <Explainable text="Escrita"/> y <Explainable text="financiada"/> por la comunidad.
            </div>
            </div>
            <div className="text-center text-lg mt-8 text-gray-800">
                Con <Explainable text="personas reales"/> y <Explainable text="sin algoritmos"/> <Explainable text="ni noticias falsas"/>.
            </div>
        </div>

        <div className="flex justify-center">
            <SignupButton className="w-64 h-12 gray-btn font-bold mb-16" text="Empezar"/>
        </div>

        <div className="flex flex-col items-center max-w-[800px]">
        <Explanation id="informacion" title="Información">
            <div className="flex justify-center text-center">
                <p>Vas a encontrar artículos informativos escritos colaborativamente, que representan consensos y publicaciones de usuarios individuales, que pueden contener apreciaciones personales, análisis, relatos, etc.
                </p>
                
            </div>
        </Explanation>
        <Explanation id="abierta" title="Abierta a discusión">
            <div className="flex flex-col items-center text-center">
                <p>Todo está abierto a discusión.</p><p> En cualquier artículo o publicación vas a poder agregar comentarios, incluso sobre selecciones de texto.</p>
            </div>
        </Explanation>
        <Explanation id="escrita" title="Escrita por la comunidad">
            <div className="flex justify-center text-center">
                <p>
                    Además de agregar comentarios, cualquier usuario puede contribuir con contenido y recibir una remuneración en función del valor que otros usuarios encuentran en lo que escribe.
                </p>
            </div>
        </Explanation>
        <Explanation id="financiada" title="Financiada por la comunidad">
            <div className="flex flex-col justify-center text-center">
                <p>Cabildo Abierto se financia exclusivamente con suscripciones mensuales de sus usuarios.</p>
                <p>Con esto se cubre el desarrollo de la plataforma y el trabajo de los autores.</p>
                <p>Hay además un pozo de suscripciones gratuitas del que el que lo necesite puede agarrar.</p>
            </div>
        </Explanation>
        <Explanation id="personas reales" title="Con personas reales">
            <div className="flex flex-col justify-center text-center">
            <p>En Cabildo Abierto los usuarios son personas se hacen cargo de lo que dicen, como en la vida real.</p>
            <p>No hay bots en la discusión y tampoco segundas cuentas.</p>
            </div>
        </Explanation>
        <Explanation id="sin algoritmos" title="Sin algoritmos">
            <div className="flex flex-col items-center text-center">
                <p>No usamos inteligencia artificial para elegir el contenido que consumen los usuarios en función de su comportamiento previo.</p>
                <p>La selección y priorización de contenido está exclusivamente bajo tu control.</p>
            </div>
        </Explanation>
        <Explanation id="ni noticias falsas" title="Sin noticias falsas">
            <div className="flex flex-col items-center text-center">
                <p>La libertad de expresión es uno de los motivadores centrales de esta plataforma, pero no es un derecho absoluto.</p>

                <p>En Cabildo Abierto podés denunciar publicaciones falsas dando los argumentos correspondientes, abriendo una discusión transparente sobre su veracidad.</p>
            </div>
                
        </Explanation>
        </div>
    </div>
};
