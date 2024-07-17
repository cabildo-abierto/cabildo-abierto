'use server'

import {db} from "@/db";
import {getUserId} from "@/actions/get-user";

export type ContentProps = {
    id: string
    createdAt: Date
    author: {
        id: string
        name: string
    } | null
    text: string
    _count: {
        childrenComments: number
        likedBy: number
        dislikedBy: number
    }
    likedBy: []
    dislikedBy: []
    type: string
    childrenComments?: []
    childrenCommentsWithData?: []
};

export async function getContentById(contentId: string) {
    const userId = await getUserId()
    let content: ContentProps | null = await db.content.findUnique(
        {select: {
                id: true,
                text: true,
                createdAt: true,
                author: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
                likedBy: {
                    where: {
                        id: userId
                    }
                },
                dislikedBy: {
                    where: {
                        id: userId
                    }
                },
                childrenComments: true,
                _count: {
                    select: {
                        childrenComments: true,
                        likedBy: true,
                        dislikedBy: true,
                    },
                },
                type: true
        },
            where: {
                id: contentId,
            }
        }
    )
    const childrenWithData = await Promise.all(content.childrenComments.map(async (child) => {
        return await getContentById(child.id)
    }))

    return {content: content, children: childrenWithData}
}

export type ContentWithLinks = React.JSX.Element | string | React.JSX.Element[]


export async function getPosts() {
    const userId = await getUserId()

    let contents: ContentProps[] = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true
                },
            },
            likedBy: {
                where: {
                    id: userId
                }
            },
            dislikedBy: {
                where: {
                    id: userId
                }
            },
            _count: {
                select: { 
                    childrenComments: true,
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true,
        },
        where: {
            type: {
                in: ["FastPost", "Post"]
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return contents
}


export async function getPostsFollowing() {
    const userId = await getUserId()

    const followedUsers = await db.user.findUnique({
        where: {
            id: userId,
        },
    }).following();

    const followedUsernames = followedUsers.map(user => user.id);

    let contents: ContentProps[] = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
                select: {
                    name: true,
                    id: true
                },
            },
            likedBy: {
                where: {
                    id: userId
                }
            },
            dislikedBy: {
                where: {
                    id: userId
                }
            },
            _count: {
                select: { 
                    childrenComments: true,
                    likedBy: true,
                    dislikedBy: true,
                },
            },
            type: true
        },
        where: {
            AND: [
                {
                    type: {in: ["FastPost", "Post", "Comment"]}
                },
                {
                    authorId: {in: followedUsernames}
                }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return contents
}