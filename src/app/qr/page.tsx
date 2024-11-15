import QRCode from "react-qr-code"
import { Logo } from "../../components/logo"



const Page = () => {
    return <div className="flex flex-col items-center bg-white p-16">
    <div className="mb-16 flex flex-col items-center">
        <div className="">
            <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="ml-4 flex h-full items-center mt-4 justify-center flex-col">
            <h1 className="lg:text-5xl text-[1.7rem]">Cabildo Abierto</h1>
            <h2 className="text-gray-600 text-xl lg:text-3xl sm:mt-2 my-0 py-0">
                Discutí lo público
            </h2>
        </div>
    </div>
    <QRCode value="https://www.cabildoabierto.com.ar" size={300}/>
    <div className="text-xl mt-4">
        www.cabildoabierto.com.ar
    </div>
</div>  
}

export default Page