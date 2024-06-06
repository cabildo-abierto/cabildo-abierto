function getBigrams(str) {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i += 1) {
        bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
}

function intersect(set1, set2) {
    return new Set([...set1].filter((x) => set2.has(x)));
}

function diceCoefficient(str1, str2) {
    const bigrams1 = getBigrams(str1);
    const bigrams2 = getBigrams(str2);
    return (2 * intersect(bigrams1, bigrams2).size) / (bigrams1.size + bigrams2.size);
}

export default function diceCoefficientDistance(str1, str2) {
    str1 = str1.toLowerCase()
    str2 = str2.toLowerCase()
    if(str1.length == 0 || str2.length == 0)
        return Number(str1 != str2)
    if(str1.length == 1)
        return Number(str2.indexOf(str1) == -1)
    if(str2.length == 1)
        return Number(str1.indexOf(str2) == -1)
    return 1-diceCoefficient(str1, str2);
}
