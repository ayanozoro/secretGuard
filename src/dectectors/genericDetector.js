const suspiciousKeywords = [
    "API_KEY",
    "API_SECRET",
    "SECRET",
    "PASSWORD",
    "PASSWD",
    "TOKEN",
    "AUTH_TOKEN",
    "ACCESS_TOKEN",
    "PRIVATE_KEY",
    "CLIENT_SECRET",
    "DATABASE_PASSWORD"
];

const ignoredValues = [
    "YOUR_API_KEY",
    "YOUR_API_SECRET",
    "YOUR_PASSWORD",
    "YOUR_TOKEN",
    "YOUR_SECRET",
    "CHANGE_ME",
    "CHANGE-THIS",
    "REPLACE_ME",
    "REPLACE_THIS",
    "EXAMPLE",
    "DUMMY",
    "PLACEHOLDER",
    "TEST"
];

function isPlaceholder(value) {
    const normalized = value.trim().toUpperCase();

    return ignoredValues.includes(normalized);
}

export function detectGenericSecrets(content, filePath) {
    const matches = [];

    suspiciousKeywords.forEach(keyword => {
        const regex = new RegExp(`${keyword}\*s*[:=]\s*(["']?)(.*?)(["']?)`, "gi")
        let match;

    })
}