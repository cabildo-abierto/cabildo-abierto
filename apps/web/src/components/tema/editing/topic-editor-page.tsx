import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useEffect, useState} from "react";
import type {LexicalEditor} from "lexical";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {useTopicPageParams} from "../use-topic-page-params";
import {addDefaults} from "../props/topic-prop-editor";
import dynamic from "next/dynamic";
import {cn} from "@/lib/utils";
import {useSession} from "@/components/auth/use-session";
import {WarningIcon} from "@phosphor-icons/react";
import { Note } from "@/components/utils/base/note";


const TopicPropsEditingPanel = dynamic(() => import("../props/topic-props-editing-panel").then(mod => mod.TopicPropsEditingPanel), {ssr: false})


const SaveEditButton = dynamic(() => import("./save-edit-button").then(mod => mod.SaveEditButton), {ssr: false})

const TopicEditor = dynamic(() => import("./topic-editor").then(mod => mod.TopicEditor), {ssr: false})

const TopicHeaderEditor = dynamic(() => import("./topic-header-editor").then(mod => mod.TopicHeaderEditor), {ssr: false})


export const TopicEditorPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const [editor, setEditor] = useState<LexicalEditor | null>()
    const [props, setProps] = useState<ArCabildoabiertoWikiTopicVersion.TopicProp[] | null>()
    const {isMobile} = useLayoutConfig()
    const [guardEnabled, setGuardEnabled] = useState(false)
    const {user} = useSession()

    useEffect(() => {
        if (topic && topic != "loading") {
            setProps(addDefaults(topic.props, topic.id))
        }
    }, [topic])

    if (!topic || topic == "loading") {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={cn("space-y-8 pb-32", isMobile ? "pt-6" : "pt-8")}>
        {!user && <Note className={"flex items-center space-x-2 text-[var(--text-light)] font-light panel-dark w-full p-4"}>
            <WarningIcon/>
            <div>
                Iniciá sesión para editar un tema.
            </div>
        </Note>}
        <div className={"fixed top-14 right-2 z-[200] space-y-2 flex flex-col items-end"}>
            <SaveEditButton
                topic={topic}
                editor={editor}
                props={props}
                setGuardEnabled={setGuardEnabled}
            />

            {props && <TopicPropsEditingPanel
                props={props}
                setProps={setProps}
                topic={topic}
            />}
        </div>

        <div className={"max-[850px]:px-4 space-y-8"}>

            {props && <TopicHeaderEditor
                topicId={topic.id}
                props={props}
                setProps={setProps}
            />}

            <div className={"pb-16"}>
                <TopicEditor
                    topicId={topic.id}
                    props={props}
                    setEditor={setEditor}
                    guardEnabled={guardEnabled}
                    setGuardEnabled={setGuardEnabled}
                />
            </div>
        </div>
    </div>
}