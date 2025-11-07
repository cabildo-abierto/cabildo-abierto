"use client"
import ArticleEditor, {ArticleEditorFromDraft} from "../../../../components/writing/article/article-editor"
import {ArticleEditorFromPublished} from "@/components/writing/article/article-editor-from-published";
import {useSearchParams} from "next/navigation";
import {NavigationGuardProvider} from "next-navigation-guard";


const Page = () => {
    const searchParams = useSearchParams()
    const i = searchParams.get("i")
    const r = searchParams.get("r")

    if(typeof i == "string"){
        return <NavigationGuardProvider>
            <ArticleEditorFromDraft id={i}/>
        </NavigationGuardProvider>
    } else if(typeof r == "string"){
        return <NavigationGuardProvider>
            <ArticleEditorFromPublished rkey={r}/>
        </NavigationGuardProvider>
    } else {
        return <NavigationGuardProvider>
            <ArticleEditor/>
        </NavigationGuardProvider>
    }

}

export default Page