import Link from "next/link";
import { EntityProps } from "src/app/lib/definitions";
import { diff, nodesCharDiff } from "./diff";
import { editorStateFromJSON } from "./editor/wiki-editor";


function round2(x: number){
    return Math.round(x * 100) / 100
}


export const ShowContributors = ({entity, version}: {entity: EntityProps, version: number}) => {

    const charsContributed = new Map<string, number>()
    
    let prevNodes = []
    for(let i = 0; i <= version; i++){
        const parsedVersion = editorStateFromJSON(entity.versions[i].text)
        if(!parsedVersion) continue

        const nodes = parsedVersion.root.children
        const {newChars} = nodesCharDiff(prevNodes, nodes)

        const author = entity.versions[i].authorId

        if(charsContributed.has(author)){
            charsContributed.set(author, charsContributed.get(author) + newChars)
        } else {
            charsContributed.set(author, newChars)
        }

        prevNodes = [...nodes]
    }

    const contributionArray = Array.from(charsContributed)
    
    let total = 0
    contributionArray.forEach(([author, count]) => {total += count})

    return <div className="flex">
        <span className="mr-1">Escrito por</span>
    <div className="flex space-x-2 link">
        {contributionArray.map(([authorId, chars], index) => {
            return <span key={index}><Link href={"/perfil/"+authorId}>@{authorId}</Link> ({round2(chars / total * 100)}%)</span>
        })}
    </div>
    </div>
}