import {$Typed} from "@/lex-api/util";
import {
    ArCabildoabiertoFeedDefs,
    ArCabildoabiertoWikiTopicVersion,
    ArCabildoabiertoDataDataset,
    ArCabildoabiertoEmbedRecord
} from "@/lex-api";
import {BaseButtonProps} from "@/components/layout/base/baseButton";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";
import {DotsThreeIcon} from "@phosphor-icons/react";
import {OptionsShareButton} from "./options-share-button";
import OptionsDeleteButton, {ConfirmDeleteModal} from "@/components/layout/options/options-delete-button";
import OptionsBlueskyReactionsButton from "@/components/layout/options/options-bluesky-reactions-button";
import OptionsOpenInBlueskyButton from "@/components/layout/options/options-open-in-bluesky-button";
import {OptionsEnDiscusionButton} from "@/components/layout/options/options-en-discusion-button";
import {OptionsEditContentButton} from "@/components/layout/options/options-edit-content-button";
import {AppBskyFeedPost} from "@atproto/api";
import {useState} from "react";
import {ConfirmEnDiscusionModal} from "@/components/layout/options/confirm-en-discusion-modal";
import dynamic from "next/dynamic";


const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {ssr: false})

export const ContentOptionsButton = ({
                                         record,
                                         enDiscusion = false,
                                         showBluesky,
                                         setShowBluesky,
                                         iconSize,
    className
                                     }: {
    record?: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory> | $Typed<ArCabildoabiertoDataDataset.DatasetView> | $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic>
    enDiscusion?: boolean
    showBluesky?: boolean
    setShowBluesky?: (v: boolean) => void
    iconSize?: BaseButtonProps["size"]
    className?: string
}) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [enDiscusionModalOpen, setEnDiscusionModalOpen] = useState(false)
    const [editingPost, setEditingPost] = useState(false)

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
    </>
};