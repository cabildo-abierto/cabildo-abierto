import dynamic from "next/dynamic";
const BskyRichTextContent = dynamic(() => import("@/components/feed/post/bsky-rich-text-content"), {
    ssr: false,
    loading: () => <></>,
});


const ProfileDescription = ({description, className=""}: {description: string, className?: string}) => {
    if(!description || description.length === 0) return null
    return <div key={description}>
        <BskyRichTextContent
            post={{text: description}}
        />
    </div>
}


export default ProfileDescription