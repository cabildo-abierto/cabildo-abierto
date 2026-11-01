import {TopicEditCancelButton} from '@/components/topic-edit-cancel-button';
import {Button} from "@/components/ui/button";

export function TopicEditActionButtons({saving, saveDisabled, onCancel, onSave, confirmCancel = false}: {
    confirmCancel?: boolean
    saving: boolean
    saveDisabled: boolean
    onCancel: () => void
    onSave: () => void
}) {
    return <div className="flex justify-end gap-2">
        <TopicEditCancelButton disabled={saving} requiresConfirmation={confirmCancel} onCancel={onCancel}/>
        <Button type="button" size="sm" onClick={onSave} disabled={saving || saveDisabled}>{saving ? "Guardando…" : "Guardar"}</Button>
    </div>;
}
