import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import Link from "next/link";
import { ContentProps } from "@/actions/get-content";
import { getUser, UserProps } from "@/actions/get-user";
import { getContentsMap } from "@/components/update-context";
import { ErrorPage } from "@/components/error-page";
import dynamic from "next/dynamic";
import { ReadOnlyEditor } from "@/components/editor/read-only-editor";


const DraftButton: React.FC<{draft: ContentProps, index: number, user: UserProps}> = ({draft, index, user}) => {
    return <div className="">
        <div className="panel w-full">
            <div className="px-2 py-2">
                <ReadOnlyEditor initialData={draft.text}/>
            </div>
        </div>
        <div className="flex justify-end mt-1 mr-1">
            <Link href={"/editar/"+draft.id}>
                <button className="gray-btn">Editar</button>
            </Link>
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
                return <li key={index} className="py-4">
                    <DraftButton draft={draft} index={index} user={user}/>
                </li>
            })}
        </ul>
    </>

    return <ThreeColumnsLayout center={center}/>
};

export default Drafts;

