import BlueskyLogo from "@/components/icons/bluesky-logo";

type Props = {
    showBluesky: boolean
    setShowBluesky: (v: boolean) => void
}

export const ShowBlueskyButton = ({showBluesky, setShowBluesky}: Props) => {
    return <button
        className={"rounded-full h-7 w-7 flex justify-center items-center " + (!showBluesky ? "hover:bg-[var(--background-dark)]" : "hover:bg-[var(--background-dark)] bg-[var(--background-dark2)]")}
        onClick={() => {setShowBluesky(!showBluesky)}}
    >
        <BlueskyLogo/>
    </button>
}