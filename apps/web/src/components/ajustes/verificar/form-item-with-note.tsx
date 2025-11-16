import {FormItem, FormItemProps} from "./form-item";
import { Note } from "@/components/utils/base/note";

export const FormItemWithNote = ({note, ...props}: Omit<FormItemProps, "contentBelow"> & { note?: string }) => {

    const contentBelow = note ? <Note className={"text-left"}>
        {note}
    </Note> : undefined

    return <FormItem contentBelow={contentBelow} {...props}/>
}