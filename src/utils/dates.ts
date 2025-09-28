

export const formatIsoDate = (
    isoDate: string | Date, hoursAndMinutes: boolean = false, day: boolean = true, year: boolean = true) => {
    const date = new Date(isoDate)
    try {
        return new Intl.DateTimeFormat("es-AR", {
            year: year && day ? "numeric" : undefined,
            month: day ? "long" : undefined,
            day: day ? "numeric" : undefined,
            hour: hoursAndMinutes ? "2-digit" : undefined,
            minute: hoursAndMinutes ? "2-digit" : undefined,
            hour12: false,
            timeZone: "America/Argentina/Buenos_Aires",
        }).format(date)
    } catch {
        return isoDate.toString()
    }
}