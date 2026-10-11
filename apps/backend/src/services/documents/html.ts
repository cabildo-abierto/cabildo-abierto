import {parse, type DefaultTreeAdapterMap} from 'parse5';

const ignored = new Set(['head', 'script', 'style', 'template', 'noscript']);
const boundaries = new Set(['p', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'td', 'th', 'br', 'hr']);

export function htmlPlainText(html: string): string {
    const output: string[] = [];
    const visit = (node: DefaultTreeAdapterMap['node']) => {
        if ('tagName' in node) {
            if (ignored.has(node.tagName) || node.attrs.some(attr => attr.name === 'hidden' || (attr.name === 'aria-hidden' && attr.value === 'true')
                || (attr.name === 'style' && /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attr.value)))) return;
            if (boundaries.has(node.tagName)) output.push('\n');
        }
        if ('value' in node && node.nodeName === '#text') output.push(node.value.replace(/\s+/g, ' '));
        if ('childNodes' in node) node.childNodes.forEach(visit);
        if ('tagName' in node && boundaries.has(node.tagName)) output.push('\n');
    };
    visit(parse(html));
    return output.join('').replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function decodeDocumentHtml(data: Buffer, contentType: string): string {
    const declared = /charset\s*=\s*["']?([^\s;"'>]+)/i.exec(contentType)?.[1]
        ?? /charset\s*=\s*["']?([^\s;"'>]+)/i.exec(data.subarray(0, 4096).toString('latin1'))?.[1];
    const bom = data[0] === 0xff && data[1] === 0xfe ? 'utf-16le' : data[0] === 0xfe && data[1] === 0xff ? 'utf-16be'
        : data.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) ? 'utf-8' : null;
    return new TextDecoder(bom ?? declared ?? 'utf-8', {fatal: true}).decode(data);
}
