import Link from "next/link";
import React from "react"

const temas = [
    {"nombre": "General"},
    {"nombre": "Economía"},
    {"nombre": "Política"},
    {"nombre": "Deportes"},
    {"nombre": "Derecho"},
    {"nombre": "Entretenimiento"},
    {"nombre": "Gastronomía"},
    {"nombre": "Turismo y viajes"},
    {"nombre": "Historia"},
    {"nombre": "Música"},
    {"nombre": "Salud"},
    {"nombre": "Sociedad"},
]

const Tema: React.FC<{ nombre: string }> = ({ nombre }) => {
    return <Link
        className="flex items-center justify-center h-32 w-48 bg-white border border-gray-300 rounded-lg shadow-sm transition-shadow duration-600 ease-in-out cursor-pointer text-lg font-medium text-gray-700 hover:text-black transform hover:scale-105"
        href={"/tema/" + nombre}
    >
        {nombre}
    </Link>
}

const TopicsPage: React.FC = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-wrap justify-center">
                {temas.map((tema, index) => (
                    <div key={index} className="mb-8 w-full sm:w-1/2 lg:w-1/3 flex justify-center">
                        <Tema nombre={tema.nombre} />
                    </div>
                ))}
            </div>
        </div>
    )
}
export default TopicsPage