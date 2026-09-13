export function topicAuthorName(author: {id: string; username: string}, currentUserId?: string): string {
    return author.id === currentUserId ? "vos" : `@${author.username}`;
}
