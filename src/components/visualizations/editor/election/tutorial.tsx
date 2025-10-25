import { topicUrl } from "@/utils/uri"
import Link from "next/link"



export const ElectionVisualizationTutorial = ({height}: {
    height: number
}) => {
    return <div className={"p-4 space-y-1 overflow-y-auto custom-scrollbar"} style={{height}}>
        <p>
            Todos los datos que ves en esta visualización pueden ser editados. Para editar datos sobre un candidato, alianza o distrito tenés que:
        </p>
        <ol>
            <li>
                Ir a la página del tema correspondiente (podés llegar tocando el botón que dice {'"Tema"'}).
            </li>
            <li>
                Apretar el botón <span className={"text-[var(--text-light)]"}>Editar</span>.
            </li>
            <li>
                Abrir la <span className={"text-[var(--text-light)]"}>Ficha</span> del tema (arriba a la dercha) y modificar el contenido.
            </li>
            <li>
                Apretar el botón <span className={"text-[var(--text-light)]"}>Guardar</span>.
            </li>
        </ol>
        <p>
            Una vez hecho eso, tu edición va aparecer en el historial de ese tema para que otros la revisen. Si es aceptada los cambios se van a ver reflejados en la visualización.     <Link
            href={topicUrl("Cabildo Abierto: Wiki")} className={"text-[var(--text-light)] underline"}>Acá</Link> podés leer más sobre cómo funcionan las votaciones en los temas.
        </p>
        <p>
            Si todavía no existe la propiedad en la ficha del tema, la podés crear vos. En este gráfico se usan las siguientes propiedades (es importante que uses el mismo nombre):
        </p>
        <ul className={"pl-5"}>
            <li>
                <span className={"font-semibold"}>Foto.</span> En alianzas y candidatos, para el logo y la foto personal (texto).
            </li>
            <li>
                <span className={"font-semibold"}>Propuestas.</span> En alianzas (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Partidos.</span> En alianzas (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Antecedentes académicos.</span> En candidatos (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Antecedentes profesionales.</span> En candidatos (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Antecedentes en el Estado.</span> En candidatos (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Patrimonio declarado.</span> En candidatos (texto).
            </li>
            <li>
                <span className={"font-semibold"}>Controversias.</span> En candidatos (lista de textos).
            </li>
            <li>
                <span className={"font-semibold"}>Otros datos.</span> En candidatos y alianzas (lista de textos).
            </li>
        </ul>
    </div>
}