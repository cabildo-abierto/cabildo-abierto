const formatter = new Intl.DateTimeFormat("es-AR", {dateStyle: "medium", timeStyle: "short"});

export function formatTopicBlockDate(value: string): string {
    return formatter.format(new Date(value));
}
