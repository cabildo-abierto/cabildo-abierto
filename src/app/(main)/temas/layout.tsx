
export function generateMetadata({params}){
    const {i} = params
    return {
        title: i,
        description: "Artículo sobre " + i + " en Cabildo Abierto."
    }
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <>{children}</>
}