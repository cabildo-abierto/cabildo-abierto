import LexicalEditor from "./lexical-editor"




const LexicalContent = ({text}: {text: string}) => {
    const editorState = JSON.parse(text)

    const settings = {
      
    }

    return <LexicalEditor settings={settings} setOutput={() => {}}/>
}

export default LexicalContent