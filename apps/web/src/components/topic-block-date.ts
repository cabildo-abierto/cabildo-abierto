const formatter = new Intl.DateTimeFormat("es-AR", {dateStyle: "medium", timeStyle: "short"});

export function formatTopicBlockDate(value: string): string {
    return formatter.format(new Date(value));
}

export function formatRelativeDate(value: string, now = Date.now()): string {
    const elapsedSeconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000));
    if (elapsedSeconds < 60) return `${elapsedSeconds}s`;
    if (elapsedSeconds < 3_600) return `${Math.floor(elapsedSeconds / 60)}m`;
    if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3_600)}h`;
    if (elapsedSeconds < 2_592_000) return `${Math.floor(elapsedSeconds / 86_400)}d`;
    if (elapsedSeconds < 31_536_000) return `${Math.floor(elapsedSeconds / 2_592_000)}mo`;
    return `${Math.floor(elapsedSeconds / 31_536_000)}a`;
}
