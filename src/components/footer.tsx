
export default function Footer() {
    return (
        <div className="fixed bottom-0">
        <footer className="px-2 border-t h-6 w-screen">
            <div className="flex justify-end items-center">
                <span className="mr-1">Escribinos a </span><a href="mailto:contacto@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</a>
                {false && <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-500">Política de privacidad</a>
                    <a href="#" className="hover:text-blue-500">Términos de servicio</a>
                </div>}
            </div>
        </footer>
        </div>
    );
}