"use client"

import { useState } from "react"
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { addDislike, addLike, removeLike, removeDislike } from "@/actions/likes";

export const LikeCounter = ({content}) => {
    const wasLiked = content.likedBy.length > 0
    const wasDisliked = content.dislikedBy.length > 0
    const [liked, setLiked] = useState(wasLiked)
    const [disliked, setDisliked] = useState(wasDisliked)
    const likeCount = content._count.likedBy + liked - wasLiked
    const dislikeCount = content._count.dislikedBy + disliked - wasDisliked

    const like_icon = <ThumbUpOutlinedIcon sx={{ fontSize: 18 }}/>
    const dislike_icon = <ThumbDownOutlinedIcon sx={{ fontSize: 18 }}/>
    return <div className="flex">
        <div className="flex items-center px-3">
            {liked ?
                <button onClick={async () => {setLiked(false); await removeLike(content.id)}} className="text-sm mr-1">
                    {like_icon}               
                </button> : 
                <button onClick={async () => {setLiked(true); setDisliked(false); await addLike(content.id)}} className="text-sm mr-1">
                    {like_icon}               
                </button>
            }
            <div className="text-gray-600 text-sm">{likeCount}</div>
        </div>
        <div className="flex items-center px-3">
            {disliked ?
                <button onClick={async () => {setDisliked(false); await removeDislike(content.id)}} className="text-sm mr-1">
                    {dislike_icon}               
                </button> : 
                <button onClick={async () => {setDisliked(true); setLiked(false); await addDislike(content.id)}} className="text-sm mr-1">
                    {dislike_icon}               
                </button>
            }
            <div className="text-gray-600 text-sm">{dislikeCount}</div>
        </div>
    </div>
}