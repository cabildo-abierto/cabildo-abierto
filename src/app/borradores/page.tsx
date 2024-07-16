import React, { useEffect, useRef, useState } from "react";
import { createPost } from '@/actions/create-content'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getDrafts } from "@/actions/get-draft";
import HtmlContent from "@/components/editor/ckeditor-html-content";
import Link from "next/link";


const DraftButton = ({draft, index}) => {
    return <div>
        <div className="panel">
            <div className="px-2 py-2">
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


const Drafts: React.FC = async () => {
    const drafts = await getDrafts()

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

