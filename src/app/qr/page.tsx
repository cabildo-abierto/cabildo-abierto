import QRCode from "react-qr-code"
import { Logo } from "../../components/logo"



const Page = () => {
    return <div className="flex flex-col items-center bg-white py-16">
    <div className="mb-16 flex flex-col items-center">
        <div className="">
            <Logo className="lg:w-28 lg:h-28 h-16 w-16"/>
        </div>
        <div className="flex h-full items-center mt-4 justify-center flex-col text-center">
            <h1 className="lg:text-[3rem] text-[2.3rem]">Cabildo Abierto</h1>
            <div className="text-[1rem] lg:text-[1.3rem] sm:mt-2 my-0 py-0">
                Una plataforma para la discusión pública.
            </div>
        </div>
    </div>
    <QRCode value="https://www.cabildoabierto.com.ar" size={300}/>
    <div className="text-xl mt-4">
        www.cabildoabierto.com.ar
    </div>
</div>  
}

export default Page