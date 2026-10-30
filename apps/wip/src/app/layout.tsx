import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "../lib/utils";
import { Footer } from "../components/footer";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
export const metadata: Metadata = {
  title: "Cabildo Abierto",
  description: "Estamos trabajando en una nueva versión de Cabildo Abierto.",
};
const themeScript = `(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const update = () => {
    let mode = 'system';
    try { mode = localStorage.getItem('themeMode') || 'system'; } catch {}
    document.documentElement.classList.toggle('dark', mode === 'dark' || (mode !== 'light' && media.matches));
  };
  update();
  media.addEventListener('change', update);
  window.addEventListener('storage', update);
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es" spellCheck={false} className={cn(geist.variable)} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <script defer src="https://cloud.umami.is/script.js" data-website-id="594aea65-e040-4cbf-8a84-b08df698307a" />
    </head>
    <body>
      <div className={cn("flex min-h-screen flex-col justify-between")}>
        {children}
        <Footer />
      </div>
    </body>
  </html>;
}
