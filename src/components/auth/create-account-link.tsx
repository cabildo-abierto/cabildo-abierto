
import { CustomLink as Link } from '../ui-utils/custom-link';



export const CreateAccountLink = ({text}: {text: string}) => {
    return <div className="mt-2 text-center">
        <Link href="/login" className="link3 text-sm text-[var(--text-light)]">{text}</Link>
    </div>
}