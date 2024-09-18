import Link from "next/link"



export const NotFoundPage = () => {
    return <div className="text-center">
      <h2 className="py-16">Error 404</h2>
      <p className="mb-16">No pudimos encontrar la página.</p>
      <Link className="gray-btn" href="/">Volver al inicio</Link>
    </div>
}