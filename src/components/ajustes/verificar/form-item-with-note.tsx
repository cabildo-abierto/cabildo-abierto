import {FormItem, FormItemProps} from "@/components/ajustes/verificar/form-item";
import {Note} from "@/components/layout/utils/note";

export const FormItemWithNote = ({note, ...props}: Omit<FormItemProps, "contentBelow"> & { note?: string }) => {

    const contentBelow = note ? <Note className={"text-left"}>
        {note}
    </Note> : undefined

    return <FormItem contentBelow={contentBelow} {...props}/>
}