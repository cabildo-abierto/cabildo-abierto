


export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');         // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Month is 0-indexed, add 1 and pad
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


export const launchDate = new Date(2024, 9, 10) // 10 de octubre de 2024


export const formatIsoDate = (isoDate) => {
    const date = new Date(isoDate);
    const argentinaTime = new Intl.DateTimeFormat("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Argentina/Buenos_Aires",
    }).format(date);

    return argentinaTime;
}