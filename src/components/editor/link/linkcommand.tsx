/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { Command, findAttributeRange, toMap } from 'ckeditor5';
import getRangeText from './utils';

function entityLink(link){
	return "/wiki/" + encodeURI(link.replace(" ", "_"))
}

export default class LinkCommand extends Command {
    refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		// When the selection is collapsed, the command has a value if the caret is in an abbreviation.
		if ( firstRange.isCollapsed ) {
			console.log("Selection collapsed")
			if ( selection.hasAttribute( 'link' ) ) {
				console.log("And there is a link")
				const attributeValue = selection.getAttribute( 'link' );

				// Find the entire range containing the abbreviation under the caret position.
				const abbreviationRange = findAttributeRange( selection.getFirstPosition(), 'link', attributeValue, model );

				this.value = {
					text: getRangeText( abbreviationRange ),
					link: attributeValue,
					range: abbreviationRange
				};
			} else {
				console.log("And there is no link")
				this.value = null;
			}
		}
		// When the selection is not collapsed, the command has a value if the selection contains a subset of a single abbreviation
		// or an entire abbreviation.
		else {
			if ( selection.hasAttribute( 'link' ) ) {
				const linkValue = selection.getAttribute( 'link' );

				// Find the entire range containing the abbreviation under the caret position.
				const abbreviationRange = findAttributeRange( selection.getFirstPosition(), 'link', linkValue, model );

				if ( abbreviationRange.containsRange( firstRange, true ) ) {
					this.value = {
						text: getRangeText( firstRange ),
						link: linkValue,
						range: firstRange
					};
				} else {
					this.value = null;
				}
			} else {
				this.value = null;
			}
		}

		// The command is enabled when the "abbreviation" attribute can be set on the current model selection.
		this.isEnabled = model.schema.checkAttributeInSelection( selection, 'link' );
	}

	execute( { text, link } ) {
		console.log("Executing with", text, link)
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// If selection is collapsed then update the selected abbreviation or insert a new one at the place of caret.
			if ( selection.isCollapsed ) {
				console.log("Executing with collapsed selection")
				// When a collapsed selection is inside text with the "abbreviation" attribute, update its text and title.
				if ( this.value ) {
					console.log("With value")
					const { end: positionAfter } = model.insertContent(
						writer.createText( text, { link: entityLink(link) } ),
						this.value.range
					);
					// Put the selection at the end of the inserted abbreviation.
					writer.setSelection( positionAfter );
				}
				// If the collapsed selection is not in an existing abbreviation, insert a text node with the "abbreviation" attribute
				// in place of the caret. Because the selection is collapsed, the attribute value will be used as a data for text.
				// If the abbreviation is empty, do not do anything.
				else if ( text !== '' ) {
					console.log("Without value")
					const firstPosition = selection.getFirstPosition();

					// Collect all attributes of the user selection (could be "bold", "italic", etc.)
					const attributes = toMap( selection.getAttributes() );

					// Put the new attribute to the map of attributes.
					attributes.set( 'link', entityLink(link) );

					// Inject the new text node with the abbreviation text with all selection attributes.
					const { end: positionAfter } = model.insertContent( writer.createText( text, attributes ), firstPosition );

					// Put the selection at the end of the inserted abbreviation. Using an end of a range returned from
					// insertContent() just in case nodes with the same attributes were merged.
					writer.setSelection( positionAfter );
				}

				// Remove the "abbreviation" attribute attribute from the selection. It stops adding a new content into the abbreviation
				// if the user starts to type.
				writer.removeSelectionAttribute( 'link' );
			} else {
				console.log("Selection is not collapsed")
				// If the selection has non-collapsed ranges, change the attribute on nodes inside those ranges
				// omitting nodes where the "abbreviation" attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'link' );

				for ( const range of ranges ) {
					writer.setAttribute( 'link', entityLink(link), range );
				}
			}
		} );
	}
}