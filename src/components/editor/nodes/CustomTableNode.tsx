
import {TableNode} from '@lexical/table';
import { EditorConfig, LexicalEditor } from 'lexical';

export class CustomTableNode extends TableNode {
    static getType(): string {
        return "custom-table";
    }
  
    static clone(node: CustomTableNode): CustomTableNode {
        return new CustomTableNode(node.__key);
    }
  
    createDOM(config: EditorConfig): HTMLElement {
        // Create a wrapper element to contain the table
        const wrapper = document.createElement('div');
        wrapper.style.maxWidth = "100vw";    // Constrain the width to the viewport
        wrapper.style.overflowX = "auto";    // Add horizontal scroll when needed

        wrapper.style.fontSize = "0.78rem";  // Set the font size to be smaller
        // Create the actual table element
        const tableElement = super.createDOM(config);
        
        // Append the table into the wrapper
        wrapper.appendChild(tableElement);

        return wrapper;  // Return the wrapper as the DOM element
    }
}
