
import './globals.scss'
import { Metadata } from 'next'
//import { Roboto_Mono, Roboto, Roboto_Condensed, Roboto_Serif, Roboto_Slab, Roboto_Flex } from 'next/font/google'
//import { Bodoni_Moda, Lora, Inter, Source_Serif_4, PT_Serif } from 'next/font/google'
import { PT_Serif} from 'next/font/google'


const pt_serif = PT_Serif({
    subsets: ['latin'],
    variable: '--font-pt-serif',
    display: 'swap',
    weight: ["400", "700"]
})

/*const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['400'],
})

const roboto_condensed = Roboto_Condensed({
  subsets: ['latin'],
  variable: '--font-roboto-condensed',
  display: 'swap',
  weight: ['400', '700'],
})

const roboto_serif = Roboto_Serif({
  subsets: ['latin'],
  variable: '--font-roboto-serif',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
})

const roboto_slab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
  weight: ['400', '700'],
})

const roboto_flex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto-flex',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const bodoni_moda = Bodoni_Moda({
    subsets: ['latin'],
    variable: '--font-bodoni',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800', '900'],
})

const lora = Lora({
    subsets: ['latin'],
    variable: '--font-lora',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
})*/

const fonts = [
    /*roboto_mono.variable, 
    roboto.variable, 
    roboto_serif.variable, 
    roboto_slab.variable, 
    roboto_flex.variable, 
    roboto_condensed.variable,
    bodoni_moda.variable,
    lora.variable,
    inter.variable,*/
    pt_serif.variable
]


export const metadata: Metadata = {
  title: 'Cabildo Abierto',
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <html lang="es" spellCheck="false" className={fonts.join(" ")}>
        <head>
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="bg-[var(--background)]">
            {children}
        </body>
    </html>
}
