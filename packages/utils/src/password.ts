

export function getPasswordStrength(password: string): number {
    let score = 0

    if (!password) {
        return 0
    }

    const length = password.length

    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length

    score += variety

    if (length >= 8) score++
    if (length >= 12) score++

    return Math.min(score, 4)
}