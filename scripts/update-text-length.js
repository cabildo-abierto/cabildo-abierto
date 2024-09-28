
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


export function getAllText(node){
  let text = ""
  if(node.type == "text"){
      text += node.text
  }
  if(node.children)
      for(let i = 0; i < node.children.length; i++){
          text += getAllText(node.children[i])
      }
  return text
}



(async () => {
    const contents = await db.content.findMany({
        select: {
            id: true,
            text: true
        }
    })

    for(let i = 0; i < contents.length; i++){
        console.log("updating content", i)
        const text = contents[i].text
        if(text == "Este artículo está vacío!") continue
        if(text.length == 0) continue;
        const json = JSON.parse(text)
        const str = getAllText(json.root)
        console.log("str", str)
        console.log("children", json.root.children.length)
        const data = {
            numChars: str.length,
            numWords: str.split(" ").length,
            numNodes: json.root.children.length,
            plainText: str
        }
        await db.content.update({
            data: data,
            where: {
              id: contents[i].id
            }
        })
    }
})();
