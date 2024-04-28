import Header from "@/app/header";
import DiscussionList from "@/app/discussion-list";


export default function Home() {

    const discussions = [
        {
            title: 'Deberia haber IVA en Argentina?',
            description: 'El IVA es un impuesto a las transacciones internas, penaliza a la actividad.',
            comments: []
        },
        {
            title: 'Cuanto presupuesto se deberia asignar a las Universidades Publicas?',
            description: 'El gobierno nacional le asigno 5M de pesos este anio.',
            comments: []
        },
        {
            title: 'Deberiamos tener Sociedades Anonimas en el futbol argentino?',
            description: 'Las sociedades anonimas...',
            comments: []
        },
    ];

    return <>
        <Header/>
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">En tendencia</h1>
            <DiscussionList discussions={discussions}/>
        </div>
    </>;
}
