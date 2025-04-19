import {SessionOptions} from "iron-session";

export const supportDid = "did:plc:rup47j6oesjlf44wx4fizu4m"
export const tomasDid = "did:plc:2356xofv4ntrbu42xeilxjnb"

/*export const myCookieOptions: SessionOptions = {
    cookieName: 'sid',
    password: process.env.COOKIE_SECRET || "",
    cookieOptions: {
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/"
    }
}*/


export const myCookieOptions: SessionOptions = {
    cookieName: 'sid',
    password: process.env.COOKIE_SECRET || "",
    cookieOptions: {
        sameSite: "lax",
        httpOnly: true,
        secure: false,
        path: "/"
    }
}