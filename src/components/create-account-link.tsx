import Link from "next/link"



export const CreateAccountLink = ({text}: {text: string}) => {
    return <div className="mt-2 text-center">
        <Link href="/" className="link3 text-sm text-[var(--text-light)]">{text}</Link>
    </div>
}