
export default function Footer() {
    return <footer className="h-5 border-t border-gray-300 px-2 w-screen text-gray-800">
        <div className="flex justify-center text-sm items-center text-[var(--accent-dark)]">
            <a href="mailto:contacto@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</a>
            {false && <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-500">Política de privacidad</a>
                <a href="#" className="hover:text-blue-500">Términos de servicio</a>
            </div>}
        </div>
    </footer>
}