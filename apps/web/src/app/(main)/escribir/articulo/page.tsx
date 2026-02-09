"use client"
import ArticleEditor, {ArticleEditorFromDraft} from "@/components/writing/article/article-editor"
import {ArticleEditorFromPublished} from "@/components/writing/article/article-editor-from-published";
import {useSearchParams} from "next/navigation";
import {NavigationGuardProvider} from "next-navigation-guard";
import {ContentContextProvider} from "@/components/layout/contexts/content-context";


const Page = () => {
    const searchParams = useSearchParams()
    const i = searchParams.get("i")
    const r = searchParams.get("r")

    return <NavigationGuardProvider>
        <ContentContextProvider content={{type: "uri", uri: "unpublished"}}>
            {typeof i == "string" && <ArticleEditorFromDraft id={i}/>}
            {typeof i != "string" && typeof r == "string" && <ArticleEditorFromPublished
                rkey={r}
            />}
            {typeof i != "string" && typeof r != "string" && <ArticleEditor/>}
        </ContentContextProvider>
    </NavigationGuardProvider>
}

export default Page