import { Command } from 'ckeditor5';
import { ButtonView } from 'ckeditor5';


export function Highlight( editor ) {

    editor.conversion.for( 'upcast' ).elementToAttribute( {
        model: 'highlight',
        view: 'mark'
    } );
    
    // Convert model attribute to output `<mark>` HTML element.
    editor.conversion.for( 'dataDowncast' ).attributeToElement( {
        model: 'highlight',
        view: 'mark'
    } );
    
    // Convert model attribute to `<mark>` in editing view.
    editor.conversion.for( 'editingDowncast' ).attributeToElement( {
        model: 'highlight',
        view: 'mark'
    } );

    console.log("Adding command highlight")
    editor.commands.add( 'highlight', new HighlightCommand( editor ) );

    editor.ui.componentFactory.add( 'highlight', ( locale ) => {
        const button = new ButtonView( locale );
        const command = editor.commands.get( 'highlight' );
        const t = editor.t;
    
        button.set( {
            label: t( 'Highlight' ),
            withText: true,
            tooltip: true,
            isToggleable: true
        } );
    
        button.on( 'execute', () => {
            editor.execute( 'highlight' );
            editor.editing.view.focus();
        } );
    
        button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
    
        return button;
    } );
}

class HighlightCommand extends Command {
    
    refresh() {
        console.log("Refreshing")
        const { document, schema } = this.editor.model;
        this.value = document.selection.getAttribute('highlight');
        this.isEnabled = !schema.checkAttributeInSelection( document.selection, 'highlight' );
    }

    execute() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const newValue = !this.value;
    
        model.change( ( writer ) => {
            if ( !selection.isCollapsed ) {
                console.log("Not collapsed")
                //const ranges = model.schema.getValidRanges( selection.getRanges(), 'highlight' );
                const ranges = selection.getRanges()
                console.log(selection.getRanges())
                console.log(ranges)
                for ( const range in ranges ) {
                    console.log("Range", range)
                    if ( newValue ) {
                        writer.setAttribute( 'highlight', newValue, range );
                    } else {
                        writer.removeAttribute( 'highlight', range );
                    }
                }
            }
    
            if ( newValue ) {
                return writer.setSelectionAttribute( 'highlight', true );
            }
    
            return writer.removeSelectionAttribute( 'highlight' );
        } );
        console.log("executed highlight")
    }    
}
