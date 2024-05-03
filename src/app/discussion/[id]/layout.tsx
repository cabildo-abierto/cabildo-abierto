import "@/app/globals.css";
import FeedLayout from "@/components/feed-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <FeedLayout children={children} enableNewDiscussion={true}/>
}
