


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