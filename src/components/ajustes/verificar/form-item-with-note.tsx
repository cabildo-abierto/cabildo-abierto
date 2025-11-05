import {FormItem, FormItemProps} from "@/components/ajustes/verificar/form-item";

export const FormItemWithNote = ({note, ...props}: Omit<FormItemProps, "contentBelow"> & { note?: string }) => {

    const contentBelow = note ? <div className={"text-[var(--text-light)] text-sm"}>
        {note}
    </div> : undefined

    return <FormItem contentBelow={contentBelow} {...props}/>
}