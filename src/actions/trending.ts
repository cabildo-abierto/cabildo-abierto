'use server';

import { db } from "../db";


const invalidWords = [
    "", "a", "ante", "bajo", "con", "contra", "de", "desde", "hacia", 
    "hasta", "para", "por", "según", "sin", "como", "de", "la", "las", "el", "él",
    "y", "o", "u", "e", "que", "es", "se", "un", "los", "en", "del", 
    "una", "no", "si", "sí", "más", "mas", "lo", "su", "cada", "al", "sus", "ser", "puede",
    "son", "pero", "pueden", "sobre", "también", "tambien", "\n", "artículo",
    "articulo", "siguiente"
]

function validTrending(word: string){
    return !invalidWords.includes(word.toLowerCase())
}

function cleanWord(word: string){
    const badCharacters = [":", ",", ";", "\n", '"', "'"]
    word = word.toLowerCase()
    for(let i = word.length-1; i >= 0; i--){
        if(!badCharacters.includes(word[i])){
            word = word.slice(0, i+1)
            break
        }
    }
    for(let i = 0; i < word.length; i++){
        if(!badCharacters.includes(word[i])){
            word = word.slice(i)
            break
        }
    }
    return word
}

export async function getTrending(n: number) {
    const content = await db.content.findMany({
        select: {
            text: true
        },
        where: {
            visible: true
        }
    })

    const wordCounts = new Map<string, number>()
    content.forEach((content) => {
        const words: string[] = content.text.split(" ")
        words.forEach((word) => {
            const cleanedWord = cleanWord(word)
            const current = wordCounts.get(cleanedWord)
            if(current == undefined){
                wordCounts.set(cleanedWord, 1)
            } else {
                wordCounts.set(cleanedWord, current+1)
            }
        })
    })

    const wordCountsArray = Array.from(wordCounts.entries());
    wordCountsArray.sort((a, b) => b[1] - a[1]);

    const selection = []
    for(let i = 0; i < wordCountsArray.length; i++){
        const [word, count] = wordCountsArray[i]
        if(validTrending(word)){
            selection.push({word: word, count: count})
            if(selection.length == n) break
        }
    }
    return selection
}