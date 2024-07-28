/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */

"use client"
import {
	ButtonView,
	FocusCycler,
	FocusTracker, KeystrokeHandler,
	LabeledFieldView,
	Locale,
	TemplateDefinition,
	View,
	ViewCollection,
	createLabeledInputText,
	icons,
	submitHandler
} from 'ckeditor5';

import './formview.css'
import { searchEntities } from '@/actions/search';
import { debounce } from '@mui/material';


class SearchResultsView extends View {
	items: any;
    constructor( locale?: any ) {
        super( locale );

		this.items = this.createCollection()

        this.setTemplate( {
            tag: 'div',
            attributes: {
                class: [
                    'ck-results-container'
                ]
            },
			children: this.items
        } );
    }

	update(results: any) {
		this.items.clear()
		results.forEach((item: any) => {
			this.items.add(item)
		})
	}
}



export default class FormView extends View {
	textInputView: any;
	urlInputView: any;
	keystrokes: any;
	focusTracker: FocusTracker;
	resultsContainerView: SearchResultsView;
	saveButtonView: ButtonView;
	buttonsView: View<HTMLElement>;
	cancelButtonView: Node | View<HTMLElement> | TemplateDefinition | ViewCollection<View<HTMLElement>>;
	private _focusCycler: FocusCycler;
	childViews: ViewCollection<any>;
	constructor(locale: any) {

		super(locale);

		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.textInputView = this._createInput('Texto');
		this.urlInputView = this._createInput('Entidad');

		const updateList = async () => {
			const value = this.urlInputView.fieldView.element.value;
			const results = (await searchEntities(value)).slice(0, 5);

			const buttons = results.map((r) => {
				const item = new ButtonView()
				item.set({
					label: r.name,
					withText: true
				})
				item.on("execute", () => {
					this.urlInputView.fieldView.set({value: r.name})
				})
				return item
			})

			this.resultsContainerView.update(buttons)
		}

		//this.urlInputView.fieldView.on("input", updateList)
		this.urlInputView.fieldView.on("set", debounce(updateList))
		this.saveButtonView = this._createButton('Save', icons.check, 'ck-button-save');

		// Submit type of the button will trigger the submit event on entire form when clicked 
		//(see submitHandler() in render() below).
		this.saveButtonView.type = 'submit';

		this.cancelButtonView = this._createButton('Cancel', icons.cancel, 'ck-button-cancel');

		this.buttonsView = new View()
		this.buttonsView.setTemplate({
			tag: "div",
			attributes: {
				class: ["ck-buttons-bar"]
			},
			children: [this.saveButtonView, this.cancelButtonView]
		})

		this.resultsContainerView = new SearchResultsView()

		this.cancelButtonView.delegate('execute').to(this, 'cancel');

		this.childViews = this.createCollection([
			this.buttonsView,
			this.textInputView,
			this.urlInputView,
			this.resultsContainerView,
		]);

		this._focusCycler = new FocusCycler({
			focusables: this.childViews,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate form fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate form fields forwards using the Tab key.
				focusNext: 'tab'
			}
		});

		this.setTemplate({
			tag: 'form',
			attributes: {
				class: ['ck', 'ck-entity-form'],
				tabindex: '-1'
			},
			children: this.childViews
		});
	}

	render() {
		super.render();

		submitHandler({
			view: this
		});

		this.childViews.forEach(view => {
			// Register the view in the focus tracker.
			this.focusTracker.add(view.element);
		});

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo(this.element);
	}

	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	focus() {
		// If the abbreviation text field is enabled, focus it straight away to allow the user to type.
		if (this.textInputView.isEnabled) {
			this.textInputView.focus();
		}
		// Focus the abbreviation title field if the former is disabled.
		else {
			this.urlInputView.focus();
		}
	}

	_createInput(label: string) {
		const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);

		labeledInput.label = label;

		return labeledInput;
	}

	_createButton(label: string, icon: any, className: string) {
		const button = new ButtonView();

		button.set({
			label,
			icon,
			tooltip: true,
			class: className
		});

		return button;
	}

	_createResultsContainer() {
		const locale = new Locale()
		const view = new SearchResultsView(locale);
		return view
		
	}

	_updateResultsContainer(results: any) {
		this.resultsContainerView.update(results)
	}
}