import {Button} from "@/components/ui/button";

export function TopicEditActionButtons({saving, saveDisabled, onCancel, onSave}: {
    saving: boolean
    saveDisabled: boolean
    onCancel: () => void
    onSave: () => void
}) {
    return <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="button" size="sm" onClick={onSave} disabled={saving || saveDisabled}>{saving ? "Guardando…" : "Guardar"}</Button>
    </div>;
}
