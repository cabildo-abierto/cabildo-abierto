import {useEffect, useState} from "react";
import {GoToLoginButton} from "@/components/presentacion/go-to-login-button";
import {Logo} from "@/components/utils/icons/logo";
import {cn} from "@/lib/utils";

const LandingTopbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return <>
        <div
            className={cn("w-full hidden sm:block fixed top-0 left-0 z-50 py-3 px-6 transition-all  ease-in-out", isScrolled ? "backdrop-blur  shadow-md" : "bg-transparent")}
        >
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <h2
                        className={cn("uppercase font-bold tracking-[0.026em] leading-[1.15] text-2xl transition-colors duration-300")}
                    >
                        Cabildo Abierto
                    </h2>
                </div>
                <Logo width={40} height={40}/>

                <div className="flex-1 flex justify-end">
                    <GoToLoginButton
                        inviteClassName="text-[11px] text-[var(--text-light)]"
                        textClassName={cn("text-[12px] transition-colors duration-300")}
                        text="Entrar"
                    />
                </div>
            </div>
        </div>
        <div
            className={cn("w-full sm:hidden block fixed top-0 left-0 z-50 py-3 pl-4 pr-3 transition-all items-center  ease-in-out", isScrolled ? "backdrop-blur bg-[var(--background-dark)]/50 shadow-md" : "bg-transparent")}
        >
            <div className="flex justify-between items-center">
                <div className="flex space-x-4 items-center">
                    <Logo width={40} height={40}/>
                    <h2
                        className={cn("uppercase font-bold tracking-[0.026em] text-base transition-colors max-w-32 duration-300 space-y-[-4px]")}
                    >
                        <div>
                            Cabildo
                        </div>
                        <div>
                            Abierto
                        </div>
                    </h2>
                </div>

                <div className="flex justify-end">
                    <GoToLoginButton
                        inviteClassName="text-[11px] text-[var(--text-light)]"
                        textClassName={cn("text-[12px] transition-colors duration-300")}
                        text="Entrar"
                    />
                </div>
            </div>
        </div>
    </>
};

export default LandingTopbar;
