import Link from 'next/link';
import { ReactNode } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Explainable from 'src/components/explainable';
import { SignupButton } from 'src/components/home-page';
import { ArticleIcon, FastPostIcon, PostIcon } from 'src/components/icons';
import { getTopKEntitiesByViews } from 'src/actions/actions';
import { getSubscriptionPrice } from 'src/components/utils';


const Explanation = ({id, content}: {id: string, content: ReactNode}) => {
  return <div
    id={id.replaceAll(" ", "_")}
    className="py-8 w-128 text-center text-lg">
    <Link href="#start">
    <h3 className="fancy-text mb-4"><span className="capitalize">{id[0]}</span>{id.slice(1)}</h3>
    </Link>
    <div className="space-y-4">
      {content}
    </div>
  </div>
}


const TopEntities = async () => {
    const entities = await getTopKEntitiesByViews(3)
    return <span>{entities.slice(0, 2).join(", ") + " y " + entities[2]}</span>
}


export const Presentation: React.FC = async () => {
    const className="flex flex-col"
    const informacion = <>
        <div className="py-1 text-gray-600">Tres formas de contenido</div>
        <div className={className}><span className="font-bold"><ArticleIcon/>Artículos de edición pública</span>Contienen información y cualquier usuario puede editarlos. <span className="text-gray-600">Los tres artículos más visitados de la última semana fueron: <TopEntities/>.</span></div>
        <div className={className}><span className="font-bold"><PostIcon/>Publicaciones</span>Con título y sin límite de caracteres.<span className="text-gray-600">Noticias, análisis, relato, o lo que sea.</span></div>
        <div className={className}><span className="font-bold"><FastPostIcon/>Publicaciones rápidas</span>A lo sumo 281 caracteres.<br/><span className="text-gray-600">Ráfagas comunicacionales.</span></div>
    </>

    const abierta = <>
    <p> En todo el contenido vas a poder agregar comentarios y ver los comentarios de otros, incluso sobre selecciones de texto.</p>
    <p> El diseño de la plataforma también está abierto a discusión.</p>
    </>

    const escrita = <>
      <p className="">Explicá algo que sepas, contá una noticia o analizá la realidad argentina, y te pagamos.</p> 
      <p>Todos los usuarios pueden editar artículos públicos y escribir publicaciones individuales.</p>
      <p className="">Si escribís, vas a ser remunerado en función del valor que otros usuarios encuentren en lo que escribiste.</p>
    </>

    const financiada = <>
        <p className="">La plataforma se financia exclusivamente con suscripciones mensuales de sus usuarios.</p>
        <p>Con eso cubrimos <span className="highlight">el desarrollo de la plataforma</span> y <span className="highlight">el trabajo de los autores.</span></p>
        <p className="">Gracias a esto, te ofrecemos contenido independiente: no hay publicidad y la plataforma no responde a ningún interés más que el de sus lectores.</p>
    </>

    const comunidad = <>
      <p className="">Si podés, pagás. Si no, te lo financia otro.</p>
      <p className="link">En Argentina tuvimos 41.7% de personas bajo la línea de pobreza al segundo semestre de 2023, <Link href="https://www.indec.gob.ar/indec/web/Nivel3-Tema-4-46">según el INDEC</Link>.</p>
      <p>Por eso, siempre en la plataforma va a haber un pozo de suscripciones gratuitas que pueden ser usadas por quien lo necesite.</p>
      <p>La disponibilidad de estas suscripciones depende de la cantidad de personas que elijan usarlas y la cantidad que elija donar.</p>
      <p>Más allá de esto, apuntamos a hacer suscripciones lo más baratas posibles para que resulten accesibles para la mayor cantidad de gente posible. En este momento las suscripciones cuestan ${getSubscriptionPrice()}.</p>
    </>

    const personas = <>
      <p>En Cabildo Abierto los usuarios son personas que se hacen cargo de lo que dicen, como en la vida real.</p>
      <p>No hay bots en la discusión y tampoco segundas cuentas.</p>
    </>

    const algoritmos = <>
    <p>No usamos inteligencia artificial para personalizar el contenido que ves en función de tu comportamiento.</p>
    <p>Te mostramos lo más discutido en forma transparente y la selección y priorización de contenido está exclusivamente bajo tu control.</p>
    </>

    const noticias = <>
      <p className="">No, no te podemos garantizar que no haya noticias falsas, pero:</p>
      <p>Las publicaciones pueden ser públicamente marcadas como falsas por otros usuarios, iniciando una discusión.</p>
      <p>Si hay algo falso en lo que leés, posiblemente encuentres un comentario al costado que lo indique.</p>
      <p>Si una noticia es falsa, la va a haber escrito una persona real con una única cuenta.</p>
    </>

    return <div className="flex flex-col items-center text-gray-900 mb-4" id="start">
        <div className="flex justify-center">
            <div className="flex flex-col justify-center mt-12">
                <h4 className="flex justify-center text-gray-700 sm:text-2xl mb-2">
                  Cabildo Abierto
                </h4>
                <h3 className="flex justify-center text-center lg:text-4xl md:text-4xl text-3xl px-2">
                    Una plataforma para la discusión pública argentina
                </h3>
            </div>
        </div>

        <div className="flex flex-col items-center py-12  max-w-[800px]">
            <div className="bg-gray-200 rounded px-8 py-3">
            <div className="mb-2 text-center text-xl">
                <Explainable text="Información" content={informacion}/> <Explainable text="abierta a discusión" content={abierta}/>. 
            </div>
            <div className="text-center text-xl mb-2">
                <Explainable text="Escrita" content={escrita}/> y <Explainable text="financiada" content={financiada}/> <Explainable text="por la comunidad" content={comunidad}/>.
            </div>
            </div>
            <div className="text-center text-lg mt-8 text-gray-800">
                <Explainable text="Con personas reales" content={personas}/> y <Explainable text="sin algoritmos" content={algoritmos}/> <Explainable text="ni noticias falsas" content={noticias}/>.
            </div>
        </div>

        <div className="flex justify-center">
            <SignupButton className="w-64 h-12 gray-btn font-bold mt-8" text="Empezar"/>
        </div>
        <div className="flex flex-col items-center mt-16">
          <Explanation id="Información" content={informacion}/>
          <Explanation id="abierta a discusión" content={abierta}/>
          <Explanation id="Escrita" content={escrita}/>
          <Explanation id="financiada" content={financiada}/>
          <Explanation id="por la comunidad" content={comunidad}/>
          <Explanation id="Con personas reales" content={personas}/>
          <Explanation id="sin algoritmos" content={algoritmos}/>
          <Explanation id="ni noticias falsas" content={noticias}/>
        </div>
    </div>
};
