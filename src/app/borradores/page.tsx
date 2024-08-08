import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import HtmlContent from "@/components/editor/ckeditor-html-content";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content";
import { getUser, UserProps } from "@/actions/get-user";
import { getContentsMap } from "@/components/update-context";
import { ErrorPage } from "@/components/error-page";


const DraftButton: React.FC<{draft: ContentProps, index: number}> = ({draft, index}) => {
    return <div>
        <div className="panel">
            <div className="px-2 py-2 ck-content">
                <HtmlContent content={draft.text} limitHeight={true}/>
            </div>
            <div className="flex justify-end">
                <Link href={"/editar/"+draft.id}>
                    <button className="large-btn">Editar</button>
                </Link>
            </div>
        </div>
    </div>
}


function getDraftsFromContents(contents: Record<string,ContentProps>, user: UserProps){
    const drafts: ContentProps[] = []
    Object.values(contents).forEach((content: ContentProps) => {
        if(content.isDraft && content.author?.id == user.id){
            drafts.push(content)
        }
    })
    return drafts
}


const Drafts: React.FC = async () => {
    const user = await getUser()
    const contents = await getContentsMap()

    if(!user){
        return <ErrorPage>Necesitás una cuenta para ver esta página</ErrorPage>
    }

    const drafts = getDraftsFromContents(contents, user)

    const center = <>
        <div className="py-4"><h1>Borradores</h1></div>
        <ul>
            {drafts.map((draft, index) => {
                return <li key={index}>
                    <DraftButton draft={draft} index={index}/>
                </li>
            })}
        </ul>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;

