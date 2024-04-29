import { useRouter } from 'next/router';

const Header = () => {
    const router = useRouter();

    return (
        <header className="bg-gray-800 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => router.push("/", `/`)}>Demos</h1>

                <h1 className="text-2xl font-semibold cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:text-yellow-400 tracking-wide text-blue-400" onClick={() => router.push("/signup", `/signup`)}>Registrarse</h1>
            </div>
        </header>
    );
};

export default Header;
