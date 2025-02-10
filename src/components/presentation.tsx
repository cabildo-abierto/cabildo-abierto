import { Logo } from './logo';


export const LogoAndSlogan = () => {
  return <div className="flex items-center flex-col mb-16">
        <div className="">
            <Logo className="lg:w-32 lg:h-32 h-20 w-20"/>
        </div>
        <div className="flex justify-center flex-col mt-8">
            <h1 className="lg:text-5xl text-4xl">Cabildo Abierto</h1>
            <div className="text-base text-[var(--text-light)] text-center lg:text-[1.29rem] text-[0.958rem] my-0 py-0 mt-2">
                Discutí lo público
            </div>
        </div>
    </div>
}
