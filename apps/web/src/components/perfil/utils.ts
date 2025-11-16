

export function getUsername(user: { displayName?: string, handle: string, did: string }) {
    return user.displayName ? user.displayName : (user.handle ? "@" + user.handle : user.did)
}