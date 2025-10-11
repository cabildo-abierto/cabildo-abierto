import {LexicalEditor} from "lexical";
import {useEffect, useState} from "react";
import {BaseFullscreenPopup} from "../../../../ui-utils/src/base-fullscreen-popup";
import {Button} from "../../../../ui-utils/src/button";
import {
    INSERT_TABLE_COMMAND,
} from '@lexical/table';
import {TextField} from "../../../../ui-utils/src/text-field";


export default function InsertTableModal({
                                             activeEditor,
                                             onClose,
                                             open
                                         }: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    open: boolean
}) {
    const [rows, setRows] = useState('5');
    const [columns, setColumns] = useState('5');
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        const row = Number(rows);
        const column = Number(columns);
        if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [rows, columns]);

    const onClick = () => {
        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns,
            rows,
        });

        onClose();
    };

    return (
        <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true} backgroundShadow={false}>
            <div className={"flex flex-col space-y-8 p-4 items-center"}>
                <div className={"flex space-x-4 pt-4"}>
                    <div className={"w-24"}>
                        <TextField
                            placeholder={'1 a 500'}
                            label="Filas"
                            onChange={(e) => {
                                setRows(e.target.value)
                            }}
                            value={rows}
                            type="number"
                            size={"small"}
                            sx={{backgroundColor: "var(--background-dark2)"}}
                        />
                    </div>
                    <div className={"w-24"}>
                        <TextField
                            placeholder={'1 a 50'}
                            label="Columnas"
                            onChange={(e) => {
                                setColumns(e.target.value)
                            }}
                            value={columns}
                            type="number"
                            size={"small"}
                            sx={{backgroundColor: "var(--background-dark2)"}}
                        />
                    </div>
                </div>
                <div className={"flex space-x-4"}>
                    <Button
                        variant={"outlined"}
                        disabled={isDisabled}
                        onClick={onClick}
                        size={"small"}
                    >
                        Insertar
                    </Button>
                </div>
            </div>
        </BaseFullscreenPopup>
    );
}