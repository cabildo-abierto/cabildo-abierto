import Image from "next/image";
import { cn } from "../lib/utils";

export function WipScreen() {
  return <main className={cn("flex h-[calc(100vh-200px)] flex-col items-center justify-center")}>
    <div className={cn("space-y-2")}>
      <div className={cn("flex justify-center pb-8")}>
        <Image src="/cabildo.svg" alt="Demo" width={500} height={500}
          className={cn("cabildo-image h-auto w-full max-w-[200px]")} priority />
      </div>
      <h1 className={cn("w-full text-center text-xl leading-none font-bold tracking-tight text-(--heading) md:text-2xl")}>
        Paciencia, por favor.
      </h1>
      <div className={cn("max-w-[450px] text-center text-lg text-[1rem] leading-tight font-extralight tracking-tight md:text-xl")}>
        <div>Estamos trabajando en una nueva versión</div>
        <div>de Cabildo Abierto.</div>
      </div>
    </div>
  </main>;
}
