/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Plugin } from 'ckeditor5';
import LinkCommand from './linkcommand';

export default class LinkEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			'addLink', new LinkCommand( this.editor )
		);
	}
	_defineSchema() {
		const schema = this.editor.model.schema;

    	// Extend the text node's schema to accept the abbreviation attribute.
		schema.extend( '$text', {
			allowAttributes: [ 'link' ]
		} );
	}
	_defineConverters() {
		const conversion = this.editor.conversion;
		
        // Conversion from a model attribute to a view element
		conversion.for( 'downcast' ).attributeToElement( {
			model: 'link',

            // Callback function provides access to the model attribute value
			// and the DowncastWriter
			view: ( modelAttributeValue, conversionApi ) => {
				const { writer } = conversionApi;
				return writer.createAttributeElement( 'a', {
					href: modelAttributeValue
				} );
			}
		} );

		// Conversion from a view element to a model attribute
		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'link',
				attributes: [ 'link' ]
			},
			model: {
				key: 'link',

                // Callback function provides access to the view element
				value: viewElement => {
					const link = viewElement.getAttribute( 'link' );
					return link;
				}
			}
		} );
	}
}