import {useEffect, useState} from "react";
import {GoToLoginButton} from "@/components/presentacion/go-to-login-button";
import {Logo} from "@/components/utils/icons/logo";
import {cn} from "@/lib/utils";

const LandingTopbar = () => {
    const [scrollState, setScrollState] = useState<"none" | "first-screen" | "etc">("none");

    useEffect(() => {
        const handleScroll = () => {
            const screenHeight = window.innerHeight;
            if(window.scrollY > 20 && window.scrollY < screenHeight * 0.9) {
                setScrollState("first-screen");
            } else if(window.scrollY >= screenHeight * 0.9) {
                setScrollState("etc")
            } else if(window.scrollY == 0) {
                setScrollState("none")
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return <>
        <div
            className={cn("w-full hidden sm:block fixed top-0 left-0 z-50 py-3 px-6 transition-all  ease-in-out", scrollState == "etc" ? "backdrop-blur shadow-md" : "bg-transparent")}
        >
            <div className="flex justify-between items-center space-x-2">
                <div className="flex-1">
                    <h2
                        className={cn("uppercase font-light tracking-[0em] leading-[1.15] text-base transition-colors duration-300", scrollState != "etc" && "text-[var(--background)]")}
                    >
                        Cabildo Abierto
                    </h2>
                </div>
                <Logo width={32} height={32}/>

                <div className="flex-1 flex justify-end">
                    <GoToLoginButton
                        inviteClassName="text-[11px] text-[var(--text-light)]"
                        textClassName={cn("text-[12px] transition-colors duration-300")}
                        text="Entrar"
                        variant={scrollState == "etc" ? "black" : "white"}
                    />
                </div>
            </div>
        </div>
        <div
            className={cn("w-full sm:hidden block fixed top-0 left-0 z-50 py-3 pl-4 pr-3 transition-all items-center  ease-in-out", scrollState == "etc" ? "backdrop-blur bg-[var(--background-dark)]/50 shadow-md" : "bg-transparent")}
        >
            <div className="flex justify-between items-center space-x-2">
                <div className="flex space-x-4 items-center">
                    <Logo width={32} height={32}/>
                    <h2
                        className={cn("uppercase font-light tracking-[0em] text-sm transition-colors max-w-32 duration-300 space-y-[-4px]", scrollState != "etc" && "text-[var(--background)]")}
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
                        variant={scrollState == "etc" ? "black" : "white"}
                    />
                </div>
            </div>
        </div>
    </>
};

export default LandingTopbar;
