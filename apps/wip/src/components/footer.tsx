import { cn } from "../lib/utils";
import { SocialIcon } from "./social-icon";

export function Footer() {
  return <footer className={cn("relative flex justify-between space-x-4 bg-(--background) px-8 py-16 sm:space-x-12 md:px-16 lg:px-32")}>
    <div className={cn("flex min-w-24 items-start")}>
      <div className={cn("flex items-center space-x-1")}>
        <a href="https://bsky.app/profile/cabildoabierto.ar" target="_blank" rel="noopener noreferrer" aria-label="Bluesky" className={cn("hover:opacity-70")}><SocialIcon kind="bluesky" /></a>
        <a href="https://github.com/cabildo-abierto" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={cn("hover:opacity-70")}><SocialIcon kind="github" /></a>
      </div>
    </div>
    <div className={cn("flex w-full justify-end")}>
      <div className={cn("flex flex-col space-y-1 text-sm")}>
        <div>Podés escribirnos a</div>
        <a href="mailto:soporte@cabildoabierto.ar" className={cn("font-extralight hover:opacity-70")}>contacto@cabildoabierto.ar</a>
      </div>
    </div>
  </footer>;
}
