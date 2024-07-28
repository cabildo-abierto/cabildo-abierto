/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { ButtonView, ContextualBalloon, Plugin, clickOutsideHandler } from 'ckeditor5';
import FormView from './linkview';
import getRangeText from './utils';
import '../styles.css';
import { ValueProps } from './linkcommand';

export default class LinkUI extends Plugin {
	_balloon: ContextualBalloon | null = null;
	formView: FormView | null = null;

	static get requires() {
		return [ ContextualBalloon ];
	}

	init() {
		const editor = this.editor;

        // Create the balloon and the form view.
		this._balloon = this.editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();

		editor.ui.componentFactory.add( 'internal-link', () => {
			const button = new ButtonView();

			button.label = 'Entidad';
			button.tooltip = true;
			button.withText = true;

			// Show the UI on button click.
			this.listenTo( button, 'execute', () => {
				this._showUI();
			} );

			return button;
		} );
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView( editor.locale );

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			// Grab values from the abbreviation and title input fields.
			const value = {
				text: formView.textInputView.fieldView.element.value,
				link: formView.urlInputView.fieldView.element.value
			};

			editor.execute( 'addLink', value );

            // Hide the form view after submit.
			this._hideUI();
		} );

		// Hide the form view after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI();
		} );

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon?.visibleView === formView,
			contextElements: [ this._balloon?.view.element as HTMLElement ],
			callback: () => this._hideUI()
		} );

		formView.keystrokes.set( 'Esc', ( data: any, cancel: any ) => {
            this._hideUI();
            cancel();
        } );

		return formView;
	}

	_showUI() {
		const selection = this.editor.model.document.selection;
		if(!this.formView) return

		// Check the value of the command.
		const commandValue: ValueProps = this.editor?.commands.get( 'addLink' )?.value as ValueProps;

		const position = this._getBalloonPositionData()
		if(!position) return
		this._balloon?.add( {
			view: this.formView,
			position: position
		} );

		// Disable the input when the selection is not collapsed.
		this.formView.textInputView.isEnabled = selection.getFirstRange()?.isCollapsed;

		// Fill the form using the state (value) of the command.
		if ( commandValue) {
			this.formView.textInputView.fieldView.set("value", commandValue.text);
			this.formView.urlInputView.fieldView.set("value", commandValue.link);
		}

		// If the command has no value, put the currently selected text (not collapsed)
		// in the first field and empty the second in that case.
		else {
			const selectedText = getRangeText( selection.getFirstRange() );

			this.formView.textInputView.fieldView.value = selectedText;
			this.formView.urlInputView.fieldView.value = selectedText;
		}

		this.formView.focus();
	}

	_hideUI() {
		if(!this.formView) return
		// Clear the input field values and reset the form.
		this.formView.textInputView.fieldView.value = '';
		this.formView.urlInputView.fieldView.value = '';
		// this.formView.element.reset();

		if(!this._balloon) return
		this._balloon.remove( this.formView );

		// Focus the editing view after inserting the abbreviation so the user can start typing the content
		// right away and keep the editor focused.
		this.editor.editing.view.focus();
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM
		const range = viewDocument.selection.getFirstRange()
		if(!range) return null
		target = () => view.domConverter.viewRangeToDom( range );

		return {
			target
		};
	}
}