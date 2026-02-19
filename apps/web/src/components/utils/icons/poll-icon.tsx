export const PollIcon = ({ fontSize = 24, className = "" }: {fontSize?: number, className?: string}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={fontSize}
            height={fontSize}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            {/* Top bar */}
            <rect x="3" y="5" width="14" height="2" rx="1" />

            {/* Bottom bar */}
            <rect x="3" y="11" width="18" height="2" rx="1" />

            {/* Middle bar */}
            <rect x="3" y="17" width="10" height="2" rx="1" />

        </svg>
    )
}