import { Plugin } from 'ckeditor5';
import LinkEditing from './linkediting';
import LinkUI from './linkui';

export default class InternalLink extends Plugin {
	static get requires() {
		return [ LinkEditing, LinkUI ];
	}

	public static get pluginName() {
		return 'InternalLink' as const;
	}
}