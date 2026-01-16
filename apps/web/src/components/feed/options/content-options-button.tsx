import {$Typed} from "@cabildo-abierto/api";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoEmbedRecord
} from "@cabildo-abierto/api";
import {BaseButtonProps} from "@/components/utils/base/base-button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/utils/ui/dropdown-menu";
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";
import {DotsThreeIcon} from "@phosphor-icons/react";
import {OptionsShareButton} from "./options-share-button";
import OptionsDeleteButton, {ConfirmDeleteModal} from "./options-delete-button";
import OptionsBlueskyReactionsButton from "./options-bluesky-reactions-button";
import OptionsOpenInBlueskyButton from "./options-open-in-bluesky-button";
import {OptionsEnDiscusionButton} from "./options-en-discusion-button";
import {OptionsEditContentButton} from "./options-edit-content-button";
import {AppBskyFeedPost} from "@atproto/api";
import {useState} from "react";
import {ConfirmEnDiscusionModal} from "./confirm-en-discusion-modal";
import dynamic from "next/dynamic";
import {
    TopicsMentionedModal,
    TopicsMentionedOptionsButton
} from "./topics-mentioned-options-button";


const WritePanel = dynamic(() => import('../../writing/write-panel/write-panel'), {ssr: false})

export const ContentOptionsButton = ({
                                         record,
                                         enDiscusion = false,
                                         showBluesky,
                                         setShowBluesky,
                                         iconSize,
    className
                                     }: {
    record?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
    iconSize?: BaseButtonProps["size"]
    className?: string
}) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [enDiscusionModalOpen, setEnDiscusionModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState(false)
    const [topicsMentionedModalOpen, setTopicsMentionedModalOpen] = useState(false)

    const reply = ArCabildoabiertoFeedDefs.isPostView(record) && record.record && "reply" in record.record ? (record.record as AppBskyFeedPost.Record).reply : undefined

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger
                className={"focus:outline-none"}
                onClick={e => e.stopPropagation()}
            >
                <BaseNotIconButton
                    size={iconSize}
                >
                    <DotsThreeIcon
                        color="var(--text)"
                        weight="bold"
                    />
                </BaseNotIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={"start"}
                className={className}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    onSelect={e => e.stopPropagation()}
                >
                    <OptionsDeleteButton
                        uri={record.uri}
                        reply={reply}
                        onClick={() => {
                            setDeleteModalOpen(true)
                        }}
                    />
                    <OptionsEnDiscusionButton
                        uri={record.uri}
                        enDiscusion={enDiscusion}
                        onClick={() => {setEnDiscusionModalOpen(true)}}
                    />
                    <OptionsEditContentButton
                        record={record}
                        setEditingPost={setEditingPost}
                    />
                    <OptionsOpenInBlueskyButton uri={record.uri}/>
                    <OptionsBlueskyReactionsButton
                        showBluesky={showBluesky}
                        setShowBluesky={setShowBluesky}
                    />
                    <OptionsShareButton
                        uri={record.uri}
                        handle={record.author.handle}
                    />
                    {record.author.caProfile != null && <TopicsMentionedOptionsButton
                        uri={record.uri}
                        onClick={() => {setTopicsMentionedModalOpen(true)}}
                    />}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
        {deleteModalOpen && <ConfirmDeleteModal
            uri={record.uri}
            onClose={() => {
                setDeleteModalOpen(false)
            }}
            open={true}
            reply={reply}
        />}
        {enDiscusionModalOpen && <ConfirmEnDiscusionModal
            uri={record.uri}
            onClose={() => {
                setEnDiscusionModalOpen(false)
            }}
            enDiscusion={enDiscusion}
            open={true}
        />}
        {editingPost && ArCabildoabiertoFeedDefs.isPostView(record) && <WritePanel
            open={editingPost}
            onClose={() => {
                setEditingPost(false)
            }}
            replyTo={reply?.parent ? {$type: "com.atproto.repo.strongRef", ...reply.parent} : undefined}
            postView={record}
            quotedPost={
                ArCabildoabiertoEmbedRecord.isView(record.embed) ? record.embed.record : undefined
            }

        />}
        {topicsMentionedModalOpen && <TopicsMentionedModal
            uri={record.uri}
            open={true}
            onClose={() => {setTopicsMentionedModalOpen(false)}}
        />}
    </>
};