export default function Footer() {
    return <></>
    return (
        <footer className="text-gray-400 py-1 px-2">
            <div className="container mx-auto flex justify-between items-center">
                <div></div>
                <div className="flex items-center space-x-4">
                    <p>Contacto:</p>
                    <p>contacto@cabildoabierto.com</p>
                </div>
                {false && <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-500">Política de privacidad</a>
                    <a href="#" className="hover:text-blue-500">Términos de servicio</a>
                </div>}
            </div>
        </footer>
    );
}