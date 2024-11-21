"use client"
import { useEffect, useState } from "react"
import ReadOnlyEditor from "./editor/read-only-editor"


export const Description = ({text}: {text: string | null}) => {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        setIndex(index+1)
    }, [text])

    return <div className="mb-2" key={index}>
        <ReadOnlyEditor initialData={text}/>
    </div>
}