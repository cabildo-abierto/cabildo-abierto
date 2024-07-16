

export const splitPost = (content) => {
    const split = content.text.split("</h1>")
    const title = split[0].split("<h1>")[1]
    return {title: title, text: split[1]}
}