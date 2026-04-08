

export function getUsername(user: { displayName?: string, handle: string, did: string }) {
    return user.displayName ? user.displayName : (user.handle ? "@" + user.handle : user.did)
}


export function defaultProfilePic(handle: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(handle)}`
}