
export type Vote = {id: string, vote: string}

export function getVote(id: string, votes: Vote[]){
    for(let i = 0; i < votes.length; i++){
        if(votes[i].id == id){
            return votes[i].vote
        }
    }
    return undefined
}

export function getId(s: {APELLIDO: string, NOMBRE: string}){
    return s.APELLIDO + " " + s.NOMBRE
}