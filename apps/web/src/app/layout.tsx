import '../styles/globals.css';
import {ReactNode} from "react";
import { Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import {AuthProvider} from "@/components/auth-provider";
import {QueryProvider} from "@/components/query-provider";
import {rootMetadata} from "@/utils/metadata";
import {ToastProvider} from "@/components/ui/toast";

export const metadata = rootMetadata;

const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'});

const themeScript = `
try {
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle(
    "dark",
    storedTheme === "dark" || (storedTheme === null && prefersDark)
  );
} catch {}
`;


export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return <html lang="es" spellCheck="false" suppressHydrationWarning className={cn("font-mono", geistMono.variable)}>
        <head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
            </meta>
            <script dangerouslySetInnerHTML={{__html: themeScript}}/>
            <script defer src="https://cloud.umami.is/script.js" data-website-id="594aea65-e040-4cbf-8a84-b08df698307a"></script>
        </head>
        {/* Browser extensions can add attributes to body before React hydrates. */}
        <body suppressHydrationWarning>
            <QueryProvider>
                <ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider>
            </QueryProvider>
        </body>
    </html>
}
