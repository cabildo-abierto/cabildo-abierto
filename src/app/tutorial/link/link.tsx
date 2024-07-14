import { Plugin } from 'ckeditor5';
import LinkEditing from './linkediting';
import LinkUI from './linkui';

export default class Link extends Plugin {
	static get requires() {
		return [ LinkEditing, LinkUI ];
	}
}