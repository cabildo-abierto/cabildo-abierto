import React from "react";
import Link from "next/link";
import {inter, lusitana} from "@/app/layout"
import {getUserIdByUsername} from "@/actions/get-user";
import parse from 'html-react-parser'
import Image from "next/image";
import {ContentProps, getDate, getContentWithLinks, ContentWithLinks, ContentText, AddCommentButton} from "@/components/comment"

const DiscussionComponent: React.FC<{content: ContentProps}> = async ({content}) => {
    const date = getDate(content)
    const textWithLinks: ContentWithLinks = await getContentWithLinks(content)
    
    return <div className="bg-white border-b border-t">
        <div className="flex justify-between mb-2">
            <p className="text-gray-600 ml-2 text-sm">
                <Link className="hover:text-gray-900"
                        href={"/profile/" + content.author?.id}>{content.author?.name} @{content.author?.username}</Link>
            </p>
            <p>{"👥"}</p>
            <p className="text-gray-600 text-sm mr-1">{date}</p>
        </div>

        <ContentText text={textWithLinks}/>

        <div className="flex justify-between px-1">
            <div>
                <AddCommentButton text="Agregar comentario"/>
                <AddCommentButton text="Agregar opinión"/>
            </div>
            <Link className="text-gray-600 text-sm hover:text-gray-800" href={"/content/" + content.id}>
                {content._count.childrenComments} comentarios
            </Link>
        </div>
    </div>
};

export default DiscussionComponent;