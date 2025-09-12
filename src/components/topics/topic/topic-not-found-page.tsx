
export default function TopicNotFoundPage({id}: { id: string }) {
    const name = decodeURIComponent(id).replaceAll("_", " ")

    return <>
        <div className="flex justify-center mt-32">
            <h2>No se encontró el tema</h2>
        </div>
        <div className="flex justify-center py-8 text-lg">
            {'"' + name + '"'}
        </div>
    </>
}