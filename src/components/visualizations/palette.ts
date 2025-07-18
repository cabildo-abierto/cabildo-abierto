const colors = [
    "#3080ff",
    "#ef476f",
    "#ffd166",
    "#06d6a0",
    "#fb5607",
    "#7b2cbf",
    "#003049",
    "#c1121f",
    "#7f4f24",
    "#affc41"
]

const hexToHSL = (hex: string): { h: number, s: number, l: number } => {
    hex = hex.replace(/^#/, "")
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("")
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

const hslToHex = ({ h, s, l }: { h: number, s: number, l: number }): string => {
    s /= 100
    l /= 100

    const k = (n: number) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
        const color = l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, "0")
    }
    return `#${f(0)}${f(8)}${f(4)}`
}

export const palette = (index: number): string => {
    if (index < colors.length) {
        return colors[index]
    }

    const baseIndex = index % colors.length
    const baseColor = colors[baseIndex]

    const hsl = hexToHSL(baseColor)
    const step = Math.floor(index / colors.length)
    const rotatedHue = (hsl.h + step * 47) % 360 // 47 = prime, avoids repetition

    return hslToHex({ h: rotatedHue, s: hsl.s, l: hsl.l })
}