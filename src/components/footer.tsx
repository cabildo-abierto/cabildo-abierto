export default function Footer() {
    return (
        <footer className="text-gray-700 px-2 border-t h-6">
            <div className="container mx-auto flex justify-between items-center">
                <div></div>
                <div className="flex items-center space-x-4">
                    <p>Contacto:</p>
                    <p>contacto@cabildoabierto.com.ar</p>
                </div>
                {false && <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-500">Política de privacidad</a>
                    <a href="#" className="hover:text-blue-500">Términos de servicio</a>
                </div>}
            </div>
        </footer>
    );
}