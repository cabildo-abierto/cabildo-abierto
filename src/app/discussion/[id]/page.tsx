import {db} from "@/db"
import Discussion from "@/components/discussion";
import React from "react";
import NewComment from "@/app/discussion/[id]/new-comment";
import {createComment} from "@/actions/create-comment";
import CommentSection from "@/app/discussion/[id]/comment-section";

const getDiscussion = async ({ params }) => {
    return await db.discussion.findUnique({
        where: {
            id: String(params?.id),
        },
        include: {
            author: {
                select: { name: true },
            },
        },
    });
};

const DiscussionPage: React.FC = async ({params}) => {
    const discussion = await getDiscussion({params})

    const comments = await db.comment.findMany({
        where: {discussionId: discussion.id},
    })

    const handleAddComment = async (comment) => {
        "use server"
        createComment({comment, discussionId: discussion.id})
    }

    return (
        <div className="flex justify-center mt-8">
            <div className="flex flex-col w-1/3">
                <Discussion discussion={discussion}/>
                <NewComment handleAddComment={handleAddComment}/>
                <CommentSection comments={comments}/>
            </div>
        </div>
    )
}

export default DiscussionPage
