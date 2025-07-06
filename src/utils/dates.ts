

export const formatIsoDate = (isoDate: string | Date, hoursAndMinutes: boolean = false) => {
    const date = new Date(isoDate)
    try {
        const argentinaTime = new Intl.DateTimeFormat("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: hoursAndMinutes ? "2-digit" : undefined,
            minute: hoursAndMinutes ? "2-digit" : undefined,
            hour12: false,
            timeZone: "America/Argentina/Buenos_Aires",
        }).format(date)
        return argentinaTime
    } catch (error) {
        return isoDate.toString()
    }

}