export const formatIsoDate = (isoDate, hoursAndMinutes = false, day = true, year = true) => {
    const date = new Date(isoDate);
    try {
        return new Intl.DateTimeFormat("es-AR", {
            year: year && day ? "numeric" : undefined,
            month: day ? "long" : undefined,
            day: day ? "numeric" : undefined,
            hour: hoursAndMinutes ? "2-digit" : undefined,
            minute: hoursAndMinutes ? "2-digit" : undefined,
            hour12: false,
            timeZone: "America/Argentina/Buenos_Aires",
        }).format(date);
    }
    catch {
        return isoDate.toString();
    }
};
export const formatIsoDateShort = (isoDate, hoursAndMinutes = false, day = true, year = true) => {
    const date = new Date(isoDate);
    try {
        return new Intl.DateTimeFormat("es-AR", {
            year: year && day ? "2-digit" : undefined,
            month: day ? "2-digit" : undefined,
            day: day ? "2-digit" : undefined,
            hour: hoursAndMinutes ? "2-digit" : undefined,
            minute: hoursAndMinutes ? "2-digit" : undefined,
            hour12: false,
            timeZone: "America/Argentina/Buenos_Aires",
        }).format(date);
    }
    catch {
        return isoDate.toString();
    }
};
export function sortDatesDescending(a, b) {
    return new Date(b).getTime() - new Date(a).getTime();
}
