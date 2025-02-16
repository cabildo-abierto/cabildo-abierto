import InfoPanel from "./info-panel"

export const EntityCategoriesTitle = ({name, editing}: {name: string, editing: boolean}) => {
    let info
    if(editing){
        info = "Cada tema puede estar en una o más categorías y subcategorías. Al asignar un tema a una categoría que no existe todavía (borde azul) se crea automáticamente esa categoría."
    } else {
        info = "Cada tema puede estar en una o más categorías y subcategorías. Al navegar en la pestaña de inicio vas a encontrar a los temas en las categorías a las que pertenecen."    
    }
    
    return <div className="ml-1 mb-4 flex items-center">
        <span className="mr-1 text-lg">Categorías de {name}</span>
        <InfoPanel text={info} className="w-96"/>
    </div>
}
