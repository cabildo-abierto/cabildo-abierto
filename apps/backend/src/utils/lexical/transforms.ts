import {JSDOM} from "jsdom"
import {decompress} from "@cabildo-abierto/editor-core"


export function htmlToMarkdown(html: string){

    const dom = new JSDOM(html);
    const document = dom.window.document;

    ['b', 'i', 'strong', 'em'].forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach((el: any) => {
            if (Array.from(el.children).some((child: any) => ['P', 'DIV'].includes(child.tagName))) {
                const parent = el.parentNode;
                while (el.firstChild) {
                    parent.insertBefore(el.firstChild, el);
                }
                parent.removeChild(el);
            }
        });
    });

    const TurndownService = require('turndown');
    const turndownService = new TurndownService();
    turndownService.addRule('ignoreHr', {
        filter: 'hr',
        replacement: () => ''
    });
    return turndownService.turndown(document.body.innerHTML)
}


export function anyEditorStateToMarkdownOrLexical(text: string | null, format?: string | null): {text: string, format: string} {
    if(!text || text.length == 0) {
        return {text: "", format: "markdown"}
    } else if (format == "markdown") {
        return {text, format: "markdown"}
    } else if (format == "lexical") {
        return {text, format: "lexical"}
    } else if (format == "lexical-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "lexical")
    } else if (format == "markdown-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "markdown")
    } else if (format == "html") {
        return anyEditorStateToMarkdownOrLexical(htmlToMarkdown(text), "markdown")
    } else if (format == "html-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "html")
    } else if(format == "plain-text"){
        return {text: text, format: "markdown"}
    } else if (!format) {
        return anyEditorStateToMarkdownOrLexical(text, "lexical-compressed")
    } else {
        throw Error("Formato de contenido desconocido: " + format)
    }
}