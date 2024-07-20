'use server';

import { db } from '@/db';
import { redirect } from 'next/navigation';
import { getUser } from './get-user';

const invalidWords = [
    "", "a", "ante", "bajo", "con", "contra", "de", "desde", "hacia", 
    "hasta", "para", "por", "según", "sin", "como", "de", "la", "las", "el", "él",
    "y", "o", "u", "e", "que", "es", "se", "un", "los", "en", "del", 
    "una", "no", "si", "sí", "más", "mas", "lo", "su", "cada", "al", "sus", "ser", "puede",
    "son", "pero", "pueden", "sobre", "también", "tambien"
]

function validTrending(word: string){
    return !invalidWords.includes(word.toLowerCase())
}


export async function getTrending(n) {
    const content = await db.content.findMany({
        select: {
            text: true
        }
    })

    const wordCounts = new Map<string, Number>()
    content.forEach((content) => {
        const words: string[] = content.text.split(" ")
        words.forEach((word) => {
            if(wordCounts.has(word)){
                wordCounts.set(word, wordCounts.get(word)+1)
            } else {
                wordCounts.set(word, 1)
            }
        })
    })

    const wordCountsArray = Array.from(wordCounts.entries());
    wordCountsArray.sort((a, b) => b[1] - a[1]);

    const selection = []
    for(let i = 0; i < wordCountsArray.length; i++){
        const [word, count] = wordCountsArray[i]
        if(validTrending(word)){
            selection.push([word, count])
            if(selection.length == n) break
        }
    }
    return selection
}