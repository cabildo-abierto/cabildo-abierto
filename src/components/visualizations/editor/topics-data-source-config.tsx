

export const TopicsDataSourceConfig = ({onGoToFilters}: {
    onGoToFilters: () => void
}) => {

    return <div className={"flex flex-col items-center"}>
        <div className={"text-sm text-[var(--text-light)] text-center py-16 px-4"}>
            Usá <button onClick={onGoToFilters} className={"text-[var(--primary)] hover:underline font-semibold"}>filtros</button> para elegir una lista de temas de la wiki, que van a ser los datos de tu visualización.
        </div>
    </div>
}