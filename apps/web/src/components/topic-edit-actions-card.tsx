import {EyeIcon, InfoIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {TopicEditActionButtons} from "@/components/topic-edit-action-buttons";
import {cn} from "@/lib/utils";

export function TopicEditActionsCard({modifiedCount, deletedBlockNumbers, showDeleted, message, requiresMessage, saving, saveDisabled, error, shaking, onMessageChange, onToggleDeleted, onCancel, onSave, onShakeEnd}: {
    modifiedCount: number
    deletedBlockNumbers: string[]
    showDeleted: boolean
    message: string
    requiresMessage: boolean
    saving: boolean
    saveDisabled: boolean
    error: string | null
    shaking: boolean
    onMessageChange: (message: string) => void
    onToggleDeleted: () => void
    onCancel: () => void
    onSave: () => void
    onShakeEnd: () => void
}) {
    const deletedCount = deletedBlockNumbers.length;
    const onlyDeletion = modifiedCount === 0 && deletedCount === 1;

    return <Card size="sm"
        className={cn("fixed right-4 bottom-4 z-50 w-[min(22rem,calc(100vw-2rem))] shadow-lg sm:right-6 sm:bottom-6", shaking && "animate-[block-shake_180ms_ease-in-out]")}
        onAnimationEnd={onShakeEnd}>
        <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-1">
                    {onlyDeletion ? `Borrando bloque ${deletedBlockNumbers[0]}` : <>
                        <span>Edición multibloque</span>
                        <span className="text-muted-foreground" title="Estás editando más de un bloque a la vez. Hacelo solo si tus modificaciones requieren ser hechas al mismo tiempo. Por ejemplo, para reordenar bloques, mover texto entre bloques o agregar dos párrafos que están relacionados entre sí." aria-label="Información sobre la edición multibloque">
                            <InfoIcon className="size-4" aria-hidden="true"/>
                        </span>
                    </>}
                </CardTitle>
                {onlyDeletion && <Button type="button" variant="ghost" size="icon-sm" onClick={onToggleDeleted}
                    aria-pressed={showDeleted} aria-label={showDeleted ? "Ocultar bloques eliminados" : "Ver bloques eliminados"}
                    title={showDeleted ? "Ocultar bloques eliminados" : "Ver bloques eliminados"}>
                    <EyeIcon/>
                </Button>}
            </div>
            {!onlyDeletion && modifiedCount > 0 && <p className="text-muted-foreground">
                {modifiedCount} {modifiedCount === 1 ? "bloque modificado" : "bloques modificados"}
            </p>}
            {!onlyDeletion && deletedCount > 0 && <div className="flex items-center gap-2 text-muted-foreground">
                <span>{deletedCount} {deletedCount === 1 ? "bloque borrado" : "bloques borrados"}</span>
                <Button type="button" variant="ghost" size="icon-sm" onClick={onToggleDeleted}
                    aria-pressed={showDeleted} aria-label={showDeleted ? "Ocultar bloques eliminados" : "Ver bloques eliminados"}
                    title={showDeleted ? "Ocultar bloques eliminados" : "Ver bloques eliminados"}>
                    <EyeIcon/>
                </Button>
            </div>}
            {requiresMessage && <div>
                <Input value={message} onChange={event => onMessageChange(event.target.value)} placeholder="Mensaje de edición" maxLength={500}/>
            </div>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <TopicEditActionButtons saving={saving} saveDisabled={saveDisabled} onCancel={onCancel} onSave={onSave}/>
        </CardContent>
    </Card>;
}
